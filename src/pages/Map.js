import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const Map = () => {
  const { announce, focusFirstHeading } = useAccessibility();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Campus locations and venue information
  const venues = [
    {
      id: 'main-hall',
      name: 'Main Conference Hall',
      description: 'Primary venue for keynote presentations and main sessions',
      capacity: '500 people',
      accessibility: 'Wheelchair accessible, hearing loop available, accessible toilets nearby',
      facilities: ['Hearing loop', 'Wheelchair access', 'Air conditioning', 'WiFi'],
      location: 'Ground floor, Main Building'
    },
    {
      id: 'seminar-room-1',
      name: 'Seminar Room 1',
      description: 'Smaller venue for workshops and breakout sessions',
      capacity: '50 people',
      accessibility: 'Wheelchair accessible, portable hearing loop available',
      facilities: ['Portable hearing loop', 'Wheelchair access', 'Projector', 'WiFi'],
      location: 'First floor, East Wing'
    },
    {
      id: 'seminar-room-2',
      name: 'Seminar Room 2',
      description: 'Interactive workshop space with flexible seating',
      capacity: '30 people',
      accessibility: 'Wheelchair accessible, good acoustics for group discussions',
      facilities: ['Flexible seating', 'Wheelchair access', 'Whiteboard', 'WiFi'],
      location: 'First floor, East Wing'
    },
    {
      id: 'exhibition-area',
      name: 'Exhibition Area',
      description: 'Sponsor displays and networking space',
      capacity: 'Open area',
      accessibility: 'Fully accessible, wide pathways, good lighting',
      facilities: ['Wide pathways', 'Good lighting', 'Seating areas', 'Refreshments'],
      location: 'Ground floor, Central Atrium'
    },
    {
      id: 'quiet-room',
      name: 'Quiet Room',
      description: 'Sensory-friendly space for breaks and decompression',
      capacity: '10 people',
      accessibility: 'Designed for sensory needs, low lighting, comfortable seating',
      facilities: ['Low lighting', 'Comfortable seating', 'Quiet environment', 'Sensory tools'],
      location: 'Ground floor, West Wing'
    },
    {
      id: 'catering-area',
      name: 'Catering Area',
      description: 'Lunch and refreshment service',
      capacity: '200 people',
      accessibility: 'Wheelchair accessible, dietary requirements catered for',
      facilities: ['Wheelchair access', 'Dietary options', 'Seating areas', 'Hand washing'],
      location: 'Ground floor, South Wing'
    }
  ];

  const accessibilityFeatures = [
    {
      icon: '♿',
      title: 'Wheelchair Access',
      description: 'All venues are wheelchair accessible with ramps and lifts available'
    },
    {
      icon: '🔊',
      title: 'Hearing Support',
      description: 'Hearing loops in main venues, portable loops available for smaller rooms'
    },
    {
      icon: '🚻',
      title: 'Accessible Toilets',
      description: 'Accessible toilet facilities on every floor with baby changing'
    },
    {
      icon: '🅿️',
      title: 'Accessible Parking',
      description: 'Designated accessible parking spaces near main entrances'
    },
    {
      icon: '🧭',
      title: 'Clear Signage',
      description: 'Large print, high contrast signage with symbols throughout the venue'
    },
    {
      icon: '😌',
      title: 'Quiet Spaces',
      description: 'Dedicated quiet rooms for sensory breaks and decompression'
    }
  ];

  useEffect(() => {
    focusFirstHeading();
    announce('Venue map and information page loaded');
  }, [announce, focusFirstHeading]);

  const handleMapLoad = () => {
    setMapLoaded(true);
    announce('Campus map loaded');
  };

  const handleMapError = () => {
    setMapError(true);
    console.error('❌ Error loading campus map');
    announce('Error loading campus map');
  };

  const selectLocation = (venue) => {
    setSelectedLocation(venue);
    announce(`Selected ${venue.name}`);
  };

  const downloadMap = () => {
    // In a real implementation, this would download the actual map file
    const link = document.createElement('a');
    link.href = '/Users/jacobdale-rourke/Desktop/Communication Matters/13391_UoL_Campus_Map_2025.pdf';
    link.download = 'campus-map.pdf';
    link.click();
    announce('Campus map download started');
  };

  return (
    <div className="map-page">
      <div className="container">
        <header className="page-header">
          <h1>Venue Map & Information</h1>
          <p className="page-description">
            Find your way around the conference venue with accessibility information and venue details.
          </p>
        </header>

        {/* Quick Actions */}
        <section className="quick-actions" aria-labelledby="actions-title">
          <h2 id="actions-title" className="sr-only">Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={downloadMap} className="action-card">
              <span className="action-icon" aria-hidden="true">📄</span>
              <span className="action-title">Download Map</span>
              <span className="action-description">Get the full campus map PDF</span>
            </button>

            <a href="#accessibility-info" className="action-card">
              <span className="action-icon" aria-hidden="true">♿</span>
              <span className="action-title">Accessibility Info</span>
              <span className="action-description">View accessibility features</span>
            </a>

            <a href="#venue-list" className="action-card">
              <span className="action-icon" aria-hidden="true">📍</span>
              <span className="action-title">Venue Details</span>
              <span className="action-description">Browse all conference venues</span>
            </a>
          </div>
        </section>

        {/* Campus Map */}
        <section className="map-section" aria-labelledby="map-title">
          <h2 id="map-title">Campus Map</h2>

          <div className="map-container">
            {!mapError ? (
              <div className="map-wrapper">
                <img
                  src="/Users/jacobdale-rourke/Desktop/Communication Matters/13391_UoL_Campus_Map_2025.pdf"
                  alt="University of Leicester Campus Map showing conference venues and accessibility features"
                  className="campus-map"
                  onLoad={handleMapLoad}
                  onError={handleMapError}
                />
                {!mapLoaded && (
                  <div className="map-loading" role="status" aria-live="polite">
                    <div className="loading-spinner" aria-hidden="true" />
                    <span>Loading campus map...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="map-error">
                <h3>Map Temporarily Unavailable</h3>
                <p>
                  The interactive campus map is currently unavailable.
                  You can download the PDF version or view venue details below.
                </p>
                <button onClick={downloadMap} className="btn btn-primary">
                  📄 Download PDF Map
                </button>
              </div>
            )}
          </div>

          <div className="map-legend">
            <h3>Map Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FFF275' }} />
                <span>Conference Venues</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#4CAF50' }} />
                <span>Accessible Entrances</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#2196F3' }} />
                <span>Parking Areas</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FF9800' }} />
                <span>Catering & Facilities</span>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Information */}
        <section id="accessibility-info" className="accessibility-section" aria-labelledby="accessibility-title">
          <h2 id="accessibility-title">Accessibility Features</h2>
          <p className="section-description">
            The venue is designed to be fully accessible. Here are the key accessibility features available:
          </p>

          <div className="accessibility-grid">
            {accessibilityFeatures.map((feature, index) => (
              <div key={`accessibility-${index}`} className="accessibility-card">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="accessibility-contact">
            <h3>Need Additional Support?</h3>
            <p>
              If you have specific accessibility requirements not covered above,
              please contact the conference organizers in advance.
            </p>
            <div className="contact-info">
              <strong>Accessibility Coordinator:</strong> accessibility@communicationmatters.org.uk
            </div>
          </div>
        </section>

        {/* Venue List */}
        <section id="venue-list" className="venues-section" aria-labelledby="venues-title">
          <h2 id="venues-title">Conference Venues</h2>
          <p className="section-description">
            Detailed information about each conference venue, including capacity and accessibility features.
          </p>

          <div className="venues-grid">
            {venues.map((venue) => (
              <article
                key={venue.id}
                className={`venue-card ${selectedLocation?.id === venue.id ? 'selected' : ''}`}
                onClick={() => selectLocation(venue)}
                tabIndex="0"
                role="button"
                aria-pressed={selectedLocation?.id === venue.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectLocation(venue);
                  }
                }}
              >
                <header className="venue-header">
                  <h3 className="venue-name">{venue.name}</h3>
                  <span className="venue-location">{venue.location}</span>
                </header>

                <div className="venue-details">
                  <p className="venue-description">{venue.description}</p>

                  <div className="venue-info">
                    <div className="info-item">
                      <strong>Capacity:</strong> {venue.capacity}
                    </div>
                    <div className="info-item">
                      <strong>Accessibility:</strong> {venue.accessibility}
                    </div>
                  </div>

                  <div className="venue-facilities">
                    <strong>Facilities:</strong>
                    <ul className="facilities-list">
                      {venue.facilities.map((facility, index) => (
                        <li key={`facility-${index}`}>{facility}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Selected Venue Details */}
        {selectedLocation && (
          <section className="selected-venue" aria-labelledby="selected-title">
            <h2 id="selected-title">Selected Venue: {selectedLocation.name}</h2>

            <div className="selected-details">
              <div className="selected-info">
                <h3>Venue Information</h3>
                <p><strong>Location:</strong> {selectedLocation.location}</p>
                <p><strong>Capacity:</strong> {selectedLocation.capacity}</p>
                <p><strong>Description:</strong> {selectedLocation.description}</p>
              </div>

              <div className="selected-accessibility">
                <h3>Accessibility Features</h3>
                <p>{selectedLocation.accessibility}</p>

                <h4>Available Facilities</h4>
                <ul>
                  {selectedLocation.facilities.map((facility, index) => (
                    <li key={`selected-facility-${index}`}>{facility}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setSelectedLocation(null)}
              className="btn btn-outline"
              aria-label="Close venue details"
            >
              Close Details
            </button>
          </section>
        )}
      </div>

    </div>
  );
};

export default Map;
