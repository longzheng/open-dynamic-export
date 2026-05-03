#!/bin/bash

# Script for sending MQTT setpoints to ODE (Open Dynamic Export)
# Publishes to a local broker (in docker-compose)

# Check if mosquitto_pub is available
if ! command -v mosquitto_pub &> /dev/null; then
    echo "Error: mosquitto_pub command not found"
    echo ""
    echo "To install mosquitto_pub on macOS, run:"
    echo "  brew install mosquitto"
    echo ""
    exit 1
fi

# MQTT broker settings
MQTT_HOST="localhost"
MQTT_PORT="1883"
MQTT_TOPIC="setpoints"

# Publish interval for loop mode (seconds).
# Must be shorter than the ODE stalenessTimeoutSeconds config to keep the
# dead-man switch alive.
PUBLISH_INTERVAL=60

# --- Preset definitions ---

preset_default() {
    cat <<'JSON'
{
  "opModEnergize": true,
  "opModExpLimW": 5000,
  "opModGenLimW": 20000
}
JSON
}

preset_no_export() {
    cat <<'JSON'
{
  "opModEnergize": true,
  "opModExpLimW": 0,
  "opModGenLimW": 20000
}
JSON
}

preset_self_consumption() {
    cat <<'JSON'
{
  "opModEnergize": true,
  "opModExpLimW": 0,
  "opModGenLimW": 20000,
  "batterySocMinPercent": 10,
  "batterySocMaxPercent": 100,
  "batteryDischargeMaxWatts": 5000,
  "batteryChargeMaxWatts": 5000,
  "batteryPriorityMode": "battery_first"
}
JSON
}

preset_battery_export() {
    local export_watts="${1:-3000}"
    # batteryDischargeMaxWatts must cover BOTH house load AND export target,
    # since it caps total discharge. Leave unset to use the system default
    # (battery physical max). batteryExportTargetWatts controls the export portion.
    # opModExpLimW is deliberately NOT set — stays at whatever CSIP-AUS allows.
    cat <<JSON
{
  "opModEnergize": true,
  "opModGenLimW": 20000,
  "batterySocMinPercent": 20,
  "batterySocMaxPercent": 100,
  "batteryChargeMaxWatts": 0,
  "batteryExportTargetWatts": ${export_watts},
  "batteryPriorityMode": "export_first"
}
JSON
}

preset_battery_hold() {
    cat <<'JSON'
{
  "opModEnergize": true,
  "opModExpLimW": 5000,
  "opModGenLimW": 20000,
  "batteryDischargeMaxWatts": 0,
  "batteryChargeMaxWatts": 0
}
JSON
}

# --- Functions ---

publish_message() {
    local message="$1"
    mosquitto_pub -h "${MQTT_HOST}" -p "${MQTT_PORT}" -t "${MQTT_TOPIC}" -m "${message}"
}

publish_loop() {
    local message="$1"
    echo ""
    echo "Publishing every ${PUBLISH_INTERVAL}s (Ctrl+C to stop and revert)"
    echo "When stopped, ODE will revert to fixed setpoints after stalenessTimeoutSeconds"
    echo ""

    trap 'echo ""; echo "Stopped. ODE will revert after staleness timeout."; exit 0' INT

    while true; do
        local timestamp
        timestamp=$(date '+%H:%M:%S')
        if publish_message "${message}"; then
            echo "[${timestamp}] published"
        else
            echo "[${timestamp}] FAILED to publish"
        fi
        sleep "${PUBLISH_INTERVAL}"
    done
}

show_menu() {
    echo ""
    echo "MQTT Setpoint Presets"
    echo "====================="
    echo ""
    echo "  1) Default          - export limit 5kW, no battery control"
    echo "  2) No export        - zero export, no battery control"
    echo "  3) Self-consumption - zero export, battery covers house load"
    echo "  4) Battery export   - discharge battery to grid (prompts for watts)"
    echo "  5) Battery hold     - prevent charge and discharge (hold SoC)"
    echo "  6) Custom           - enter raw JSON"
    echo ""
    echo "Options:"
    echo "  --loop              - keep publishing (for dead-man switch)"
    echo ""
}

# --- Main ---

LOOP_MODE=false
PRESET=""
EXPORT_WATTS=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --loop)
            LOOP_MODE=true
            shift
            ;;
        --preset)
            PRESET="$2"
            shift 2
            ;;
        --export-watts)
            EXPORT_WATTS="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--preset NUM] [--export-watts WATTS] [--loop]"
            echo ""
            echo "  --preset NUM         Select preset (1-6)"
            echo "  --export-watts WATTS Set battery export power for preset 4 (default: 3000)"
            echo "  --loop               Publish repeatedly every ${PUBLISH_INTERVAL}s"
            echo ""
            show_menu
            exit 0
            ;;
        *)
            echo "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# Interactive menu if no preset given
if [ -z "${PRESET}" ]; then
    show_menu
    read -rp "Select preset [1-6]: " PRESET
fi

case "${PRESET}" in
    1)
        MQTT_MESSAGE=$(preset_default)
        ;;
    2)
        MQTT_MESSAGE=$(preset_no_export)
        ;;
    3)
        MQTT_MESSAGE=$(preset_self_consumption)
        ;;
    4)
        if [ -z "${EXPORT_WATTS}" ]; then
            read -rp "Export watts (default 3000): " EXPORT_WATTS
            EXPORT_WATTS="${EXPORT_WATTS:-3000}"
        fi
        MQTT_MESSAGE=$(preset_battery_export "${EXPORT_WATTS}")
        ;;
    5)
        MQTT_MESSAGE=$(preset_battery_hold)
        ;;
    6)
        echo "Enter JSON message (single line):"
        read -r MQTT_MESSAGE
        ;;
    *)
        echo "Invalid selection: ${PRESET}"
        exit 1
        ;;
esac

echo ""
echo "Publishing to ${MQTT_HOST}:${MQTT_PORT} topic '${MQTT_TOPIC}'"
echo "Message: ${MQTT_MESSAGE}"

if publish_message "${MQTT_MESSAGE}"; then
    echo "Message published successfully"
else
    echo "Failed to publish message"
    exit 1
fi

if [ "${LOOP_MODE}" = true ]; then
    publish_loop "${MQTT_MESSAGE}"
fi
