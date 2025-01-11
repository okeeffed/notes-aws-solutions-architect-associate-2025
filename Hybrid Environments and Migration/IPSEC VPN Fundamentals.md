---
cards-deck: AWS Exams::Solutions Architect::Associate::IPSEC VPN Fundamentals
---
## What is IPSEC? #card 

- A group of protocols that work together.
- Sets up secure tunnels across insecure networks.
	- For example, connecting to routers (peers) between networks like local and remote.
- Provides authentication between peers.
	- Any data sent between the two are encrypted.
- Anything that satisfies being classified as **interesting data** will be sent across the tunnel.

![[ipsec-overview.png]]
## Symmetric vs Asymmetric encryption #card 

- Symmetric is fast, but it useful for exchanging keys.
- Symmetric uses the same key to encrypt and decrypt.
- Asymmetric uses a private/public key combination.

## What is IKE in relation to security and encryption? #card

Internet Key Exchange.

An image to help you remember: Ike from South park is Canadian. The generated image doesn't use the Canadian style but let it make you think of Ike exchanging a key with someone else.

![[ike-memory-cue.webp]]

## What are the phases of IPSEC? #card 

- IPSEC has two main phases.
- IKE (Internet Key Exchange) Phase 1 (slow & heavy, IKE_SA negotiaion).
	- This protocol has two versions, but know that it's for exchanging keys.
	- What it does:
		- Authenticate - Pre-shared key (password) / cert.
		- Using asymmetric encryption to agree on, and create a shared symmetric key.
		- IKE security associate SA created (phase 1 channel).
- IKE Phase 2 (Fast & Agile, Child SA negotiation):
	- Uses the keys agreed in phase 1.
	- Agree encryption method, and keys used for bulk transfer.
	- Create IPSEC SA,  phase 2 channel for use in tunnel mode (architecturally running over phase 1.)

![[ike-phase-one.png]]
![[ike-phase-2.png]]

## What are the different types of VPNs? #card

- Policy-based
	- Rules set match traffic => a pair of SAs.
	- Different rules have different security settings.
- Routed-based
	- Target matching prefixes.
	- A single-pair of SA for each prefix.

![[vpn-types.png]]

## Notes from O1

First, it helps to remember that the IPsec “phases” refer to Internet Key Exchange (IKE) phases—not directly to how IP packets are tunnelled. While some documentation casually calls them “Phase 1” and “Phase 2 tunnels,” the official terminology is about IKE negotiations (IKE_SA vs. CHILD_SA). Let’s break it down carefully.

---

## Phase 1 (IKE_SA negotiation)

- **Goal**: Establish a secure (authenticated, integrity-protected, and optionally encrypted) control channel between peers (the IKE SA).
    
- **What actually happens**:
    
    1. The peers exchange key-exchange data (e.g., Diffie-Hellman) to generate shared secret key material.
    2. The peers authenticate each other (using pre-shared keys, certificates, or other credentials).
    3. A secure IKE SA is established, which **protects subsequent IKE messages**.
- **Tunnel vs. Transport?**
    
    - In Phase 1, you typically hear about “Main Mode” or “Aggressive Mode” (IKEv1) or “IKE_SA_INIT”/“IKE_AUTH” (IKEv2). This step is not where you decide _transport vs. tunnel mode_ for actual IP traffic encryption. That decision happens in Phase 2.
    - Phase 1 messages themselves are not an IPsec tunnel per se. They are IKE packets protected by an IKE SA. It’s best to think of Phase 1 as “establish a secure control channel for IKE,” rather than “an IPsec tunnel for user data.”

---

## Phase 2 (Child SA negotiation)

- **Goal**: Negotiate one or more IPsec Security Associations (SAs) to protect actual user data (the “data plane”).
    
- **What actually happens**:
    
    1. The peers negotiate the transforms (e.g., AES vs. 3DES, SHA256 vs. SHA1, ESP vs. AH, etc.).
    2. The keys for encrypting data-plane traffic (IPsec SAs) are derived from the shared secret material that was established in Phase 1 (often with new ephemeral Diffie-Hellman if PFS—Perfect Forward Secrecy— is requested).
    3. You end up with one or more **Child SAs** (i.e., IPsec SAs) that will actually protect your IP packets.
- **Tunnel vs. Transport Mode**
    
    - _In Phase 2_, you decide whether you’re using **tunnel mode** (usually site-to-site VPNs, encapsulates the entire IP packet) or **transport mode** (usually host-to-host or host-gateway, protecting only the payload).
    - You can have multiple IPsec SAs (Phase 2 “tunnels”) under the same IKE SA (Phase 1 “channel”).

---

## Common Misconceptions or Points of Clarification

1. **“Phase 1 is a tunnel that encrypts both payload and headers.”**
    
    - Not exactly. Phase 1 (IKE) negotiations _can_ be encrypted (once you have enough key material), but that’s an IKE control channel, not an IPsec tunnel that encapsulates your data traffic.
    - The “tunnel mode” typically refers to **ESP** (Encapsulating Security Payload) or AH protection in IPsec **Phase 2** for user data packets.
2. **“Phase 2 is a tunnel within a tunnel.”**
    
    - It might feel that way logically—because the first _secure channel_ (Phase 1 / IKE SA) is used to securely _negotiate_ the next set of SAs (Phase 2 / IPsec SAs).
    - But from a protocol standpoint, it’s more accurate to say: _first we establish a secure IKE SA for control traffic_, then we use it to create IPsec SAs for data traffic. It’s not literally “nesting” the data-plane tunnel inside the control channel; it’s two distinct SAs with different protocols and packet formats.
3. **Key Material**
    
    - The Diffie-Hellman exchange (done in Phase 1, and possibly repeated in Phase 2 for PFS) produces a shared secret. This secret is used in a _key derivation function_ (KDF) to generate the final encryption and authentication keys.
    - “Key material” isn’t just “what’s between the start and end blocks of the key.” It’s more of a pool or buffer of pseudo-random bits (often called SKEYIDSKEYID, Key_MATKey\_MAT, etc. in different RFCs) that IKE then slices up into the keys (e.g., encryption key, integrity key, etc.) needed for the SAs.
4. **Multiple Phase 2 SAs**
    
    - You can have more than one Child SA (Phase 2 IPsec SA) underneath the same IKE SA (Phase 1). E.g., you might have one IPsec SA protecting traffic from subnet A to subnet B, and another IPsec SA (with different cryptographic parameters) protecting traffic from subnet C to subnet D, both negotiated under the same “main” IKE SA.

---

### Summarizing Where the Confusion Might Be

- **Phase 1**: You are not (strictly speaking) running an IP tunnel for user traffic. You’re establishing a secure IKE “control channel.”
- **Phase 2**: Here is where the actual IPsec SAs (in tunnel or transport mode) get created to protect user data traffic.

So if we rephrase your understanding:

> 1. **Phase 1**: We establish an IKE SA (sometimes people loosely call it a “tunnel,” but it’s really just a secure control channel for key management).
> 2. **Key exchange**: We do Diffie-Hellman to produce a shared secret, which is used to derive all the necessary keys.
> 3. **Phase 2**: We create the IPsec SAs (often called Child SAs). These are the actual “tunnels” in tunnel mode (or direct payload encryption in transport mode). And yes, you can have multiple Phase 2 SAs under one Phase 1.

That’s the clearer mental model. The biggest correction is not to think of Phase 1 as “tunnel mode that encrypts both payload and headers” for user data; rather it’s about establishing the IKE SA for control traffic. The IPsec “tunnel mode” protecting user data is negotiated in Phase 2.

---

## Key Takeaways

1. **Phase 1 (IKE_SA)** = Secure control channel (authentication + key exchange).
2. **Phase 2 (Child SAs / IPsec SAs)** = Actual IPsec encryption/authentication for user traffic (in tunnel or transport mode).
3. The “key material” is derived from Diffie-Hellman and used to generate encryption/authentication keys; it’s not literally just the bits “between start and end blocks.”
4. You can have multiple Phase 2 SAs (IPsec SAs) under a single Phase 1 IKE SA.

I hope this clarifies where the main distinctions lie and helps refine your mental model of how Phase 1 vs. Phase 2 in IPsec/IKE work.P