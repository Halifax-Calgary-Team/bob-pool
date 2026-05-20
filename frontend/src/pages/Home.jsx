import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home Page Component
 * 
 * Landing page for the Bob Pool application.
 * Provides an overview of the platform and explains how it works.
 * 
 * Sections:
 * 1. Hero - Eye-catching introduction with main heading and tagline
 * 2. About - Description of what Bob Pool is and its key features
 * 3. How It Works - Step-by-step guide for using the platform
 */
function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/find-rides');
  };

  return (
    <div className="home-page">
      {/* Hero Section - Main introduction */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Bob Pool - IBM Carpooling</h1>
          <p className="hero-tagline">
            Connect with colleagues, share rides, save money
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => {
                document.querySelector('.about-section').scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* About Section - What is Bob Pool */}
      <section className="about-section">
        <div className="section-container">
          <h2 className="section-title">About Bob Pool</h2>
          <p className="section-description">
            Bob Pool is IBM's internal carpooling platform designed to help employees
            connect with colleagues for shared commutes. Whether you're driving to the
            office or looking for a ride, Bob Pool makes it easy to find matches and
            coordinate travel plans.
          </p>

          {/* Key Features */}
          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3 className="feature-title">Easy Ride Creation</h3>
              <p className="feature-description">
                Post your available rides with details about route, timing, and
                available seats. Let colleagues know when you're heading to the office.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Smart Search</h3>
              <p className="feature-description">
                Find rides that match your schedule and route. Filter by date, time,
                and location to find the perfect carpool match.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">✉️</div>
              <h3 className="feature-title">Email Communication</h3>
              <p className="feature-description">
                Connect directly with other IBMers via email. Coordinate pickup times
                and locations securely through your IBM email.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Cost Savings</h3>
              <p className="feature-description">
                Share fuel costs and reduce your commuting expenses. Save money while
                helping the environment.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3 className="feature-title">Environmental Impact</h3>
              <p className="feature-description">
                Reduce carbon emissions by sharing rides. Every carpool helps decrease
                traffic congestion and environmental impact.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Team Building</h3>
              <p className="feature-description">
                Connect with colleagues from different teams. Build relationships and
                network during your commute.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* How It Works Section - Step-by-step guide */}
      <section className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Getting started with Bob Pool is simple. Follow these three easy steps:
          </p>

          <div className="steps-container">
            {/* Step 1 */}
            <article className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Create Your Profile</h3>
              <p className="step-description">
                Sign up using your IBM email address. Set up your profile with your
                typical commute routes and schedule preferences. Your IBM email ensures
                a secure, internal-only platform.
              </p>
            </article>

            {/* Step 2 */}
            <article className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Post or Search for Rides</h3>
              <p className="step-description">
                If you're driving, post your available rides with details about your
                route, departure time, and available seats. If you need a ride, search
                for matches based on your location and schedule.
              </p>
            </article>

            {/* Step 3 */}
            <article className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Connect via Email</h3>
              <p className="step-description">
                Once you find a match, connect directly with your colleague through
                email. Coordinate pickup details, confirm arrangements, and start
                carpooling together!
              </p>
            </article>
          </div>

          {/* Call to Action */}
          <div className="cta-container">
            <button
              className="btn btn-primary btn-large"
              onClick={handleGetStarted}
            >
              Start Carpooling Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

// Made with Bob
