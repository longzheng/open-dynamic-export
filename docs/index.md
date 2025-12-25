---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Open Dynamic Export"
  tagline: Free open source local solar inverter export control/curtailment
  actions:
    - theme: brand
      text: User guide
      link: /guide
    - theme: alt
      text: Source code
      link: https://github.com/longzheng/open-dynamic-export
  image:
    src: /logo.svg
    alt: Open Dynamic Export

features:
  - title: Dynamic/flexible export control
    details: Certified CSIP-AUS/SEP2 client for Australian DNSP dynamic connections 
  - title: Fixed/zero export
    details: Load-following export control
  - title: Two-way tarrifs/negative feed-in
    details: Curtail export based on fixed schedules or dynamic pricing
  - title: Intelligent battery control
    details: SOC-aware battery management with configurable priority modes and multi-inverter support
---

<div class="img-dashboard">

![Dashboard UI](/dashboard.png)

</div>

<style>
:root {
  --vp-home-hero-name-color: transparent !important;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #42F35D 30%, #10D9DC) !important;

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #42F35D33 50%, #10D9DC33 50%) !important;
  --vp-home-hero-image-filter: blur(56px) !important;
}

.VPImage.image-src {
  width: 100%; 
}

.img-dashboard {
    img {
      max-width: min(600px, 100%);
      margin: 3em auto;
    }
  }

</style>