import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
const API_BASE_URL = "http://34.129.60.74";
function Dashboard() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/items/my-listings`);
        setListings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your listings');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">Profile</h3>
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Student ID:</strong> {currentUser.studentId}</p>
              <Link to="/create-listing" className="btn btn-primary">
                Create New Listing
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <h2>Your Listings</h2>
          {listings.length === 0 ? (
            <p>You haven't created any listings yet.</p>
          ) : (
            <div className="row">
              {listings.map((listing) => (
                <div key={listing._id} className="col-md-6 mb-4">
                  <div className="card">
                    {listing.imageUrl && (
                      <img 
                        src={listing.imageUrl} 
                        className="card-img-top" 
                        alt={listing.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{listing.title}</h5>
                      <p className="card-text">{listing.description}</p>
                      <p className="card-text"><strong>Price: ${listing.price}</strong></p>
                      <Link to={`/listing/${listing._id}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 