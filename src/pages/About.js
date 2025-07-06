import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('About page mounted');
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('About page loaded');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="about-page" data-testid="aboutPage">
        <div className="loading-state" data-testid="loading-state">
          <p>Loading about information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="about-page" data-testid="aboutPage">
      <div className="about-container">
        <header className="about-header">
          <h1>About Communication Matters</h1>
          <p className="about-subtitle">Advancing communication research and practice</p>
        </header>

        <section className="mission-section" data-testid="mission-section">
          <h2>Our Mission</h2>
          <div className="mission-statement" data-testid="mission-statement">
            <p>
              Communication Matters is dedicated to advancing the field of communication sciences and disorders 
              through innovative research, evidence-based practice, and collaborative learning. We strive to 
              improve the lives of individuals with communication challenges by fostering excellence in 
              clinical practice, education, and research.
            </p>
          </div>
        </section>

        <section className="vision-section" data-testid="vision-section">
          <h2>Our Vision</h2>
          <div className="vision-statement" data-testid="vision-statement">
            <p>
              To be the leading platform for communication professionals, researchers, and advocates, 
              creating a world where every individual has access to effective communication support 
              and opportunities for meaningful participation in their communities.
            </p>
          </div>
        </section>

        <section className="values-section" data-testid="values-section">
          <h2>Our Values</h2>
          <div className="values-list" data-testid="values-list">
            <div className="value-item" data-testid="value-item">
              <h3 className="value-title" data-testid="value-title">Excellence</h3>
              <p className="value-description" data-testid="value-description">
                We pursue the highest standards in research, clinical practice, and education.
              </p>
            </div>
            <div className="value-item" data-testid="value-item">
              <h3 className="value-title" data-testid="value-title">Innovation</h3>
              <p className="value-description" data-testid="value-description">
                We embrace new technologies and methodologies to advance the field.
              </p>
            </div>
            <div className="value-item" data-testid="value-item">
              <h3 className="value-title" data-testid="value-title">Collaboration</h3>
              <p className="value-description" data-testid="value-description">
                We believe in the power of working together across disciplines and communities.
              </p>
            </div>
            <div className="value-item" data-testid="value-item">
              <h3 className="value-title" data-testid="value-title">Accessibility</h3>
              <p className="value-description" data-testid="value-description">
                We ensure our resources and services are accessible to all individuals.
              </p>
            </div>
          </div>
        </section>

        <section className="history-section" data-testid="history-section">
          <h2>Our History</h2>
          <div className="timeline" data-testid="timeline">
            <div className="timeline-item" data-testid="timeline-item">
              <div className="timeline-year" data-testid="timeline-year">2020</div>
              <div className="timeline-event" data-testid="timeline-event">
                Communication Matters conference was established to bring together professionals 
                in the field of communication sciences and disorders.
              </div>
            </div>
            <div className="timeline-item" data-testid="timeline-item">
              <div className="timeline-year" data-testid="timeline-year">2021</div>
              <div className="timeline-event" data-testid="timeline-event">
                Expanded to include virtual participation options, reaching a global audience 
                of communication professionals.
              </div>
            </div>
            <div className="timeline-item" data-testid="timeline-item">
              <div className="timeline-year" data-testid="timeline-year">2022</div>
              <div className="timeline-event" data-testid="timeline-event">
                Introduced specialized tracks for research, clinical practice, and technology 
                in communication disorders.
              </div>
            </div>
            <div className="timeline-item" data-testid="timeline-item">
              <div className="timeline-year" data-testid="timeline-year">2023</div>
              <div className="timeline-event" data-testid="timeline-event">
                Launched mentorship programs and early career researcher initiatives.
              </div>
            </div>
          </div>
        </section>

        <section className="team-section" data-testid="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member" data-testid="team-member">
              <div className="member-photo" data-testid="member-photo">
                <img src="/api/placeholder/150/150" alt="Dr. Sarah Johnson" />
              </div>
              <h3 className="member-name" data-testid="member-name">Dr. Sarah Johnson</h3>
              <p className="member-role" data-testid="member-role">Conference Director</p>
              <p className="member-bio" data-testid="member-bio">
                Dr. Johnson is a leading researcher in augmentative and alternative communication 
                with over 15 years of experience in the field.
              </p>
            </div>
            <div className="team-member" data-testid="team-member">
              <div className="member-photo" data-testid="member-photo">
                <img src="/api/placeholder/150/150" alt="Prof. Michael Chen" />
              </div>
              <h3 className="member-name" data-testid="member-name">Prof. Michael Chen</h3>
              <p className="member-role" data-testid="member-role">Research Coordinator</p>
              <p className="member-bio" data-testid="member-bio">
                Prof. Chen specializes in speech-language pathology and has published extensively 
                on communication disorders in children.
              </p>
            </div>
          </div>
        </section>

        <section className="board-section" data-testid="board-section">
          <h2>Board of Directors</h2>
          <div className="board-grid">
            <div className="board-member" data-testid="board-member">
              <h3 className="board-member-name" data-testid="board-member-name">Dr. Emily Rodriguez</h3>
              <p className="board-member-position" data-testid="board-member-position">Board Chair</p>
              <p className="member-credentials" data-testid="member-credentials">
                PhD in Communication Sciences, CCC-SLP
              </p>
            </div>
            <div className="board-member" data-testid="board-member">
              <h3 className="board-member-name" data-testid="board-member-name">Dr. James Wilson</h3>
              <p className="board-member-position" data-testid="board-member-position">Vice Chair</p>
              <p className="member-credentials" data-testid="member-credentials">
                PhD in Audiology, Au.D., CCC-A
              </p>
            </div>
          </div>
        </section>

        <section className="achievements-section" data-testid="achievements-section">
          <h2>Our Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement-item" data-testid="achievement-item">
              <h3 className="achievement-title" data-testid="achievement-title">
                Excellence in Conference Programming Award
              </h3>
              <p className="achievement-description" data-testid="achievement-description">
                Recognized by the International Association of Communication Sciences for 
                outstanding conference programming and participant engagement.
              </p>
              <span className="achievement-date" data-testid="achievement-date">2023</span>
            </div>
            <div className="achievement-item" data-testid="achievement-item">
              <h3 className="achievement-title" data-testid="achievement-title">
                Innovation in Virtual Learning Award
              </h3>
              <p className="achievement-description" data-testid="achievement-description">
                Honored for pioneering virtual conference technologies that enhance 
                accessibility and global participation.
              </p>
              <span className="achievement-date" data-testid="achievement-date">2022</span>
            </div>
          </div>
        </section>

        <section className="statistics-section" data-testid="statistics-section">
          <h2>By the Numbers</h2>
          <div className="stats-grid">
            <div className="stat-item" data-testid="stat-item">
              <span className="stat-number" data-testid="stat-number">2,500+</span>
              <span className="stat-label" data-testid="stat-label">Conference Attendees</span>
            </div>
            <div className="stat-item" data-testid="stat-item">
              <span className="stat-number" data-testid="stat-number">150+</span>
              <span className="stat-label" data-testid="stat-label">Presentations</span>
            </div>
            <div className="stat-item" data-testid="stat-item">
              <span className="stat-number" data-testid="stat-number">45</span>
              <span className="stat-label" data-testid="stat-label">Countries Represented</span>
            </div>
            <div className="stat-item" data-testid="stat-item">
              <span className="stat-number" data-testid="stat-number">95%</span>
              <span className="stat-label" data-testid="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </section>

        <section className="partnerships-section" data-testid="partnerships-section">
          <h2>Partnerships & Affiliations</h2>
          <div className="partners-grid">
            <div className="partner-item" data-testid="partner-item">
              <h3 className="partner-name" data-testid="partner-name">
                International Association of Communication Sciences
              </h3>
              <p className="partner-description" data-testid="partner-description">
                Strategic partnership for advancing global communication research initiatives.
              </p>
            </div>
            <div className="partner-item" data-testid="partner-item">
              <h3 className="partner-name" data-testid="partner-name">
                National Speech-Language-Hearing Association
              </h3>
              <p className="partner-description" data-testid="partner-description">
                Collaborative efforts in professional development and continuing education.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-section" data-testid="contact-section">
          <h2>Contact Information</h2>
          <div className="contact-info" data-testid="contact-info">
            <div className="contact-item" data-testid="contact-item">
              <h3 className="contact-title" data-testid="contact-title">General Inquiries</h3>
              <p className="contact-detail" data-testid="contact-detail">
                Email: info@communicationmatters.org
              </p>
            </div>
            <div className="contact-item" data-testid="contact-item">
              <h3 className="contact-title" data-testid="contact-title">Conference Registration</h3>
              <p className="contact-detail" data-testid="contact-detail">
                Email: registration@communicationmatters.org
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;