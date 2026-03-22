#!/bin/bash

# Script for testing via MQTT to a local broker (in docker-compose)

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

# Setpoint values (JSON format)
# 
# BASIC SETPOINT PARAMETERS:
# opModConnect: (boolean) Connect/disconnect from grid
# opModEnergize: (boolean) Enable/disable energize mode
# opModExpLimW: (number) Maximum export limit in watts
# opModGenLimW: (number) Maximum generation limit in watts
# opModImpLimW: (number) Maximum import limit in watts
# opModLoadLimW: (number) Maximum load limit in watts
#
# BATTERY CONTROL PARAMETERS:
# batteryChargeRatePercent: (number) Battery charge rate as percentage
# batteryDischargeRatePercent: (number) Battery discharge rate as percentage
# batteryStorageMode: (number) Storage control mode (maps to StorCtl_Mod in Sunspec)
# batteryTargetSocPercent: (number) Target State of Charge percentage
# batteryImportTargetWatts: (number) Target import power for battery charging
# batteryExportTargetWatts: (number) Target export power for battery discharging
# batterySocMinPercent: (number) Minimum SOC percentage limit
# batterySocMaxPercent: (number) Maximum SOC percentage limit
# batteryChargeMaxWatts: (number) Maximum charging power in watts
# batteryDischargeMaxWatts: (number) Maximum discharging power in watts
# batteryPriorityMode: (string) Either "export_first" or "battery_first"
# batteryGridChargingEnabled: (boolean) Enable/disable grid charging
# batteryGridChargingMaxWatts: (number) Maximum grid charging power in watts

MQTT_MESSAGE='{
  "opModEnergize": true,
  "opModExpLimW": 5000,
  "opModGenLimW": 20000
}'

# Example with battery control parameters (uncomment and modify as needed):
# MQTT_MESSAGE='{
#   "opModEnergize": true,
#   "opModExpLimW": 5000,
#   "opModGenLimW": 20000,
#   "batteryTargetSocPercent": 80,
#   "batterySocMinPercent": 20,
#   "batterySocMaxPercent": 100,
#   "batteryChargeMaxWatts": 5000,
#   "batteryDischargeMaxWatts": 5000,
#   "batteryPriorityMode": "battery_first",
#   "batteryGridChargingEnabled": false
# }'

echo "Publishing MQTT message to ${MQTT_HOST}:${MQTT_PORT} on topic '${MQTT_TOPIC}'"
echo "Message: ${MQTT_MESSAGE}"
echo ""

# Publish the message
mosquitto_pub -h "${MQTT_HOST}" -p "${MQTT_PORT}" -t "${MQTT_TOPIC}" -m "${MQTT_MESSAGE}"

if [ $? -eq 0 ]; then
    echo "✓ Message published successfully"
else
    echo "✗ Failed to publish message"
    exit 1
fi
