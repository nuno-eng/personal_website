# Deploying Your Website to GitHub + Cloudflare

## Step 1: Prepare Your Files

1. Export both Design Components as standalone HTML files
   - Home page: `index.html`
   - Business Advisory page: `advisory.html`
   - Use the "Save as standalone HTML" skill to bundle each page with all assets

2. Create a folder structure:
   ```
   your-repo/
   ├── index.html (home page)
   ├── advisory.html (business advisory page)
   ├── assets/
   │   ├── logo.svg (your NabiaEdge logo)
   │   ├── photo.jpg (your headshot)
   │   └── vessel-os-mockup.jpg (Vessel OS screenshot)
   └── README.md
   ```

## Step 2: Set Up GitHub Repository

1. Go to [github.com](https://github.com) and create a new public repository
   - Name: `nabiaedge-website` (or your preferred name)
   - Add a README describing your site

2. Clone the repository locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nabiaedge-website.git
   cd nabiaedge-website
   ```

3. Add your files to the repository:
   ```bash
   git add .
   git commit -m "Initial commit: home and business advisory pages"
   git push origin main
   ```

## Step 3: Connect Cloudflare

1. Go to [cloudflare.com](https://cloudflare.com) and sign up / log in

2. Add your domain:
   - Click "Add a site"
   - Enter your domain (e.g., `nabiaedge.com`)
   - Select the free plan (or paid if needed)

3. Update your domain nameservers:
   - Cloudflare will provide 2 nameservers
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Replace the existing nameservers with Cloudflare's
   - Wait 24-48 hours for DNS propagation

4. Set up GitHub Pages hosting:
   - In your GitHub repo, go to **Settings → Pages**
   - Under "Source," select `main` branch
   - GitHub will provide a URL: `YOUR_USERNAME.github.io/nabiaedge-website`

5. Point Cloudflare to GitHub Pages:
   - In Cloudflare, go to **DNS**
   - Add a `CNAME` record:
     - Name: `www` (or `@` for root domain)
     - Target: `YOUR_USERNAME.github.io`
     - Proxy status: "Proxied" (orange cloud)

6. (Optional) Add SSL/TLS:
   - In Cloudflare, go to **SSL/TLS**
   - Set to "Flexible" (minimum) or "Full" for better security

## Step 4: Test Your Site

1. Visit `https://www.nabiaedge.com` (after DNS propagates)
2. Verify both pages load correctly
3. Test all links and CTAs
4. Check mobile responsiveness

## Step 5: Maintenance

- To update content, edit files locally:
  ```bash
  git add .
  git commit -m "Update content"
  git push origin main
  ```
- GitHub Pages rebuilds automatically; site updates within seconds

## Quick Checklist

- [ ] Both HTML files exported and tested locally
- [ ] GitHub repository created and files pushed
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] GitHub Pages enabled in repo settings
- [ ] DNS CNAME record added in Cloudflare
- [ ] SSL/TLS configured
- [ ] Domain resolves and site loads
- [ ] All links work
- [ ] Mobile view tested

## Costs

- **GitHub**: Free (public repo)
- **Cloudflare**: Free tier covers DNS, SSL, basic performance
- **Domain**: $10–15/year (depends on registrar and extension)
