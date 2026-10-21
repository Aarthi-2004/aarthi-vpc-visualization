# vpc-visual

An animated, beginner-friendly diagram that explains an **AWS VPC** step by step, as a gated housing society owned by a shop owner called Aarthi. Every technical term comes with an everyday analogy. No build step, no dependencies: just HTML, CSS and JavaScript.

| Technical term | Analogy |
|---|---|
| VPC | Fenced plot |
| Subnet | Lobby (public) / flats (private) |
| Internet Gateway | Main gate |
| NAT Gateway | Delivery counter |
| Security Group | Door guard |
| NACL | Gate guard |
| Load Balancer | Receptionist |
| VPN | Secret tunnel |
| VPC Peering | Private road |

## Moving objects

| Packet | Meaning |
|---|---|
| ✉️ | Visitor request |
| 💾 | Data |
| 🔁 | Database replication |
| 📦 | Software update |
| 😈 | Intruder (gets blocked) |
| 🔒 | Office VPN traffic |
| 🤝 | Partner VPC peering |

## The 9 steps

Clicking a step shows it and everything before it.

1. **VPC**: AWS Cloud region and the VPC (10.0.0.0/16)
2. **Availability Zones**: two buildings, A and B
3. **Subnets**: public (gold) and private (purple) in each zone
4. **Internet Gateway**: gate, Internet, Visitors, route table, first envelope
5. **Load Balancer**: receptionist bar and web servers in both zones
6. **App and database**: web, app, database, plus a live copy in zone B
7. **NAT Gateway**: a software update leaves via NAT and the gate
8. **Security**: SG guard tags, NACL tags, an intruder that is blocked
9. **VPN and Peering**: office secret tunnel and a partner VPC

## Run locally

```bash
cd vpc-visual
python3 -m http.server 8000
```

Open http://localhost:8000.

## Host on GitHub Pages

1. Create a new repository on GitHub and upload the contents of this folder (so `index.html` is at the repository root).
2. Open the repository's **Settings**.
3. Click **Pages** in the left menu.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Choose branch **main** and folder **/ (root)**, then click **Save**.
6. Wait a minute; your link appears at the top of the Pages screen: `https://<your-username>.github.io/<repo-name>/`.

## Project structure

```
vpc-visual/
  index.html     page structure only
  css/style.css  colours (CSS variables), layout, animation
  js/app.js      SVG helpers, diagram, step data, captions
  .nojekyll      tells GitHub Pages to serve files as they are
  LICENSE        MIT
  README.md
```

## Customise

- **Text**: edit the `STEPS` array (title, button subtitle, plain words, technical name, watch-the-picture) and `LEGEND` in `js/app.js`. Box labels are the strings passed to `box(...)`.
- **Diagram colours**: edit the `C` object at the top of `js/app.js` (blue cloud/zones, teal VPC, gold public, purple private, red security, green office).
- **Page colours and font**: edit the variables at the top of `css/style.css`, and the font link in `index.html`.
- **Speed**: auto-play is 5000 ms in `js/app.js`; packet speed is the `dur` value (seconds) in each `pk(...)` call.
