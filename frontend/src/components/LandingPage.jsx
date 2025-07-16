"use client"

import { Link } from "react-router-dom"

const LandingPage = () => {
  const features = [
    {
      icon: "⚡",
      title: "Instant Transfers",
      description: "Send money instantly to anyone, anywhere with just a few clicks. No delays, no hassles.",
    },
    {
      icon: "🔒",
      title: "Secure & Safe",
      description: "Bank-level security with end-to-end encryption to keep your money and data protected.",
    },
    {
      icon: "💰",
      title: "Low Fees",
      description: "Transparent pricing with competitive rates. Only 1% transaction fee with no hidden charges.",
    },
    {
      icon: "📱",
      title: "Easy to Use",
      description: "Simple, intuitive interface designed for everyone. Send money in just 3 easy steps.",
    },
    {
      icon: "🌍",
      title: "Wide Network",
      description: "Connect with friends, family, and businesses across the country with our extensive network.",
    },
    {
      icon: "📊",
      title: "Track Everything",
      description: "Real-time transaction tracking and detailed history to keep you informed at all times.",
    },
  ]

  const testimonials = [
    {
      name: "Nick Nyler",
      role: "Small Business Owner",
      content: "MoneyTransfer has revolutionized how I handle payments. Quick, reliable, and affordable!",
      avatar: "N",
    },
    {
      name: "Kelvin Muriithi",
      role: "Freelancer",
      content: "I love how easy it is to send money to my family. The interface is so user-friendly.",
      avatar: "K",
    },
    {
      name: "Ryan Ngugi",
      role: "Student",
      content: "Perfect for splitting bills with roommates. Fast transfers and great customer support!",
      avatar: "R",
    },
  ]

  const stats = [
    { number: "50K+", label: "Happy Users" },
    { number: "KES10M+", label: "Transferred Daily" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>MoneyTransfer</h2>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline btn-signin">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Send Money <span className="highlight">Instantly</span> & <span className="highlight">Securely</span>
            </h1>
            <p className="hero-description">
              Transfer money to friends, family, and businesses with ease. Fast, secure, and affordable money transfers
              with real-time tracking and 24/7 support.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Sending Money
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Sign In
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-preview">
                  <div className="wallet-preview">
                    <h3>Wallet Balance</h3>
                    <div className="balance">KES 25,000</div>
                  </div>
                  <div className="actions-preview">
                    <div className="action-btn">Send Money</div>
                    <div className="action-btn">Add Funds</div>
                  </div>
                  <div className="transactions-preview">
                    <div className="transaction-item">
                      <div className="transaction-info">
                        <div>Payment to John</div>
                        <div className="amount">-KES 5,000</div>
                      </div>
                    </div>
                    <div className="transaction-item">
                      <div className="transaction-info">
                        <div>Deposit via M-Pesa</div>
                        <div className="amount">+KES 10,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Choose MoneyTransfer?</h2>
            <p>Everything you need for seamless money transfers</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Send money in just 3 simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Add Beneficiary</h3>
                <p>Add the recipient's details to your beneficiaries list for quick future transfers.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Enter Amount</h3>
                <p>Choose the amount you want to send and add a description for your records.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Confirm & Send</h3>
                <p>Review the details and confirm. Money is transferred instantly to the recipient.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied customers</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Start Sending Money?</h2>
            <p>Join thousands of users who trust MoneyTransfer for their daily transactions</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>MoneyTransfer</h3>
              <p>Fast, secure, and affordable money transfers for everyone.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#security">Security</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="#help">Help Center</a>
                </li>
                <li>
                  <a href="#contact">Contact Us</a>
                </li>
                <li>
                  <a href="#status">System Status</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 MoneyTransfer. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
