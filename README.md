# kmoe
[![Build Status](https://travis-ci.org/kmoe/kmoe.svg?branch=master)](https://travis-ci.org/kmoe/kmoe)

*kmoe* is a collection of services that I use for demos and general hacking.

## Projects

### APIs for Cyborgs

#### NFC 2FA (implanted)
##### *9th May 2016*

Two-factor authentication flow in which the second factor is an implanted NFC chip. This server receives the verification request, alerts the implantee that they need to identify themselves, and receives the (TOTP-bearing) confirmation back from the PN532-connected laptop. It then responds to the verification request, confirming the presence of the second factor.
