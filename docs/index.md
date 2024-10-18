---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Open Dynamic Export"
  tagline: Open source solar inverter export control/curtailment
  actions:
    - theme: brand
      text: Guide
      link: /guide
    - theme: alt
      text: GitHub
      link: https://github.com/longzheng/open-dynamic-export
  image:
    src: /logo.svg
    alt: Open Dynamic Export

features:
  - title: Dynamic/flexible export control
    details: Certified CSIP-AUS/SEP2 client for dynamic connections of Australian DNSPs
  - title: Fixed/zero export
    details: Load-following export control
  - title: Two-way tarrifs/negative feed-in
    details: Curtail export based on fixed schedules or dynamic pricing
---


<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #42F35D 30%, #10D9DC);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #42F35D33 50%, #10D9DC33 50%);
  --vp-home-hero-image-filter: blur(56px);
}

.VPImage.image-src {
  width: 100%; 
}
</style>