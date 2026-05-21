import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  Column,
  Tile,
  Section,
} from '@carbon/react';
import {
  CarFront,
  Search,
  Email,
  Currency,
  Sprout,
  UserMultiple,
} from '@carbon/icons-react';

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

  const handleLearnMore = () => {
    document.querySelector('.about-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const features = [
    {
      icon: <CarFront size={48} />,
      title: 'Easy Ride Creation',
      description: 'Post your available rides with details about route, timing, and available seats. Let colleagues know when you\'re heading to the office.'
    },
    {
      icon: <Search size={48} />,
      title: 'Smart Search',
      description: 'Find rides that match your schedule and route. Filter by date, time, and location to find the perfect carpool match.'
    },
    {
      icon: <Email size={48} />,
      title: 'Email Communication',
      description: 'Connect directly with other IBMers via email. Coordinate pickup times and locations securely through your IBM email.'
    },
    {
      icon: <Currency size={48} />,
      title: 'Cost Savings',
      description: 'Share fuel costs and reduce your commuting expenses. Save money while helping the environment.'
    },
    {
      icon: <Sprout size={48} />,
      title: 'Environmental Impact',
      description: 'Reduce carbon emissions by sharing rides. Every carpool helps decrease traffic congestion and environmental impact.'
    },
    {
      icon: <UserMultiple size={48} />,
      title: 'Team Building',
      description: 'Connect with colleagues from different teams. Build relationships and network during your commute.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Your Profile',
      description: 'Sign up using your IBM email address. Set up your profile with your typical commute routes and schedule preferences. Your IBM email ensures a secure, internal-only platform.'
    },
    {
      number: '2',
      title: 'Post or Search for Rides',
      description: 'If you\'re driving, post your available rides with details about your route, departure time, and available seats. If you need a ride, search for matches based on your location and schedule.'
    },
    {
      number: '3',
      title: 'Connect via Email',
      description: 'Once you find a match, connect directly with your colleague through email. Coordinate pickup details, confirm arrangements, and start carpooling together!'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Section style={{
        background: 'linear-gradient(135deg, #0f62fe 0%, #002d9c 100%)',
        color: 'white',
        padding: '4rem 1rem',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'white' }}>
            Bob Pool - IBM Carpooling
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.95 }}>
            Connect with colleagues, share rides, save money
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              kind="tertiary"
              size="lg"
              onClick={handleGetStarted}
              style={{ color: 'white', borderColor: 'white' }}

            >
              Get Started
            </Button>
            <Button
              kind="ghost"
              size="lg"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>
      </Section>

      {/* About Section */}
      <Section className="about-section" style={{ backgroundColor: 'white', padding: '4rem 1rem' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>About Bob Pool</h2>
              <p style={{
                maxWidth: '700px',
                margin: '0 auto',
                color: '#525252',
                fontSize: '1.125rem'
              }}>
                Bob Pool is IBM's internal carpooling platform designed to help employees
                connect with colleagues for shared commutes. Whether you're driving to the
                office or looking for a ride, Bob Pool makes it easy to find matches and
                coordinate travel plans.
              </p>
            </div>
          </Column>

          {features.map((feature, index) => (
            <Column key={index} lg={5} md={4} sm={4} style={{ marginBottom: '2rem' }}>
              <Tile style={{
                padding: '2rem',
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{ marginBottom: '1rem', color: '#0f62fe' }}>
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#525252', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </Tile>
            </Column>
          ))}
        </Grid>
      </Section>

      {/* How It Works Section */}
      <Section style={{ backgroundColor: '#f4f4f4', padding: '4rem 1rem' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>How It Works</h2>
              <p style={{
                maxWidth: '700px',
                margin: '0 auto',
                color: '#525252',
                fontSize: '1.125rem'
              }}>
                Getting started with Bob Pool is simple. Follow these three easy steps:
              </p>
            </div>
          </Column>

          {steps.map((step, index) => (
            <Column key={index} lg={5} md={4} sm={4} style={{ marginBottom: '2rem' }}>
              <Tile style={{
                padding: '2rem',
                height: '100%',
                backgroundColor: 'white'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#0f62fe',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem'
                }}>
                  {step.number}
                </div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#525252', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </Tile>
            </Column>
          ))}

          <Column lg={16} md={8} sm={4}>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Button
                kind="primary"
                size="lg"
                onClick={handleGetStarted}
              >
                Start Carpooling Today
              </Button>
            </div>
          </Column>
        </Grid>
      </Section>
    </div>
  );
}

export default Home;

// Made with Bob
