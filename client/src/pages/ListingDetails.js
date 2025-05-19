import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

function ListingDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${id}`);
        setListing(response.data);
        const ratingsResponse = await axios.get(`http://localhost:5000/api/items/${id}/ratings`);
        setRatings(ratingsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch listing details');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/items/${id}/messages`, {
        message: message.trim()
      });
      setMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/items/${id}/status`, {
        status: newStatus,
        buyerId: currentUser._id
      });
      setListing(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleRatingSubmit = async () => {
    try {
      await axios.post(`http://localhost:5000/api/items/${id}/rate`, {
        rating,
        comment: ratingComment,
        raterId: currentUser._id
      });
      setShowRatingModal(false);
      setRating(5);
      setRatingComment('');
      // Refresh ratings
      const ratingsResponse = await axios.get(`http://localhost:5000/api/items/${id}/ratings`);
      setRatings(ratingsResponse.data);
    } catch (err) {
      setError('Failed to submit rating');
    }
  };

  if (loading) return <Container className="mt-5">Loading...</Container>;
  if (error) return <Container className="mt-5 text-danger">{error}</Container>;
  if (!listing) return <Container className="mt-5">Listing not found</Container>;

  const isOwner = currentUser && currentUser._id === listing.seller._id;
  const isBuyer = currentUser && currentUser._id === listing.buyer?._id;
  const canRate = isBuyer && listing.status === 'Sold';

  return (
    <Container className="mt-5">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>{listing.title}</h2>
                <Badge bg={
                  listing.status === 'Available' ? 'success' :
                  listing.status === 'Pending' ? 'warning' : 'secondary'
                }>
                  {listing.status}
                </Badge>
              </div>
              {listing.images && listing.images.length > 0 && (
                <img
                  src={`http://localhost:5000/uploads/${listing.images[0]}`}
                  alt={listing.title}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              )}
              <p className="mb-3">{listing.description}</p>
              <h4 className="mb-3">${listing.price}</h4>
              <p><strong>Condition:</strong> {listing.condition}</p>
              <p><strong>Location:</strong> {listing.location}</p>
              
              {isOwner && listing.status === 'Available' && (
                <Button
                  variant="warning"
                  onClick={() => handleStatusChange('Pending')}
                  className="me-2"
                >
                  Mark as Pending
                </Button>
              )}
              {isOwner && listing.status === 'Pending' && (
                <Button
                  variant="secondary"
                  onClick={() => handleStatusChange('Sold')}
                  className="me-2"
                >
                  Mark as Sold
                </Button>
              )}
              {isOwner && listing.status === 'Sold' && (
                <Button
                  variant="success"
                  disabled
                >
                  Transaction Completed
                </Button>
              )}
            </Card.Body>
          </Card>

          {/* Ratings Section */}
          <Card className="mt-4">
            <Card.Body>
              <h3>Ratings & Reviews</h3>
              {ratings.length === 0 ? (
                <p>No ratings yet</p>
              ) : (
                ratings.map((rating, index) => (
                  <div key={index} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={rating.rater.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'}
                        alt={rating.rater.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
                      />
                      <div>
                        <h5 className="mb-0">{rating.rater.name}</h5>
                        <div className="text-warning">
                          {'★'.repeat(rating.rating)}
                          {'☆'.repeat(5 - rating.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="mb-0">{rating.comment}</p>
                    <small className="text-muted">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <h4>Seller Information</h4>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={listing.seller.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'}
                  alt={listing.seller.name}
                  style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 10 }}
                />
                <div>
                  <h5 className="mb-0">{listing.seller.name}</h5>
                  <div className="text-warning">
                    {'★'.repeat(Math.round(listing.seller.rating || 0))}
                    {'☆'.repeat(5 - Math.round(listing.seller.rating || 0))}
                  </div>
                </div>
              </div>

              {!isOwner && currentUser && listing.status === 'Available' && (
                <Form onSubmit={handleMessageSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Message to Seller</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100">
                    Send Message
                  </Button>
                </Form>
              )}

              {canRate && (
                <Button
                  variant="outline-primary"
                  className="w-100 mt-3"
                  onClick={() => setShowRatingModal(true)}
                >
                  Rate this Transaction
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rate this Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="fs-4 me-2"
                    style={{ cursor: 'pointer', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRatingSubmit}>
            Submit Rating
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ListingDetails; 