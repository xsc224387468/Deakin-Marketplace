import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${id}`);
        console.log('Item data:', response.data);
        setItem(response.data);
        setLikes(response.data.likes || 0);
        setLiked(currentUser && response.data.likedBy.includes(currentUser.id));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch item details');
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, currentUser]);

  const handleContactSeller = async () => {
    try {
      if (!message.trim()) {
        alert('Please enter a message');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to send messages');
        return;
      }

      if (!currentUser || !currentUser._id) {
        alert('User information is missing. Please try logging in again.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/messages', {
        itemId: item._id,
        senderId: currentUser._id,
        receiverId: item.seller._id,
        content: message.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        alert('Message sent successfully!');
        setShowContactModal(false);
        setMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        // 可以在这里添加重定向到登录页面的逻辑
      } else {
        alert(err.response?.data?.message || 'Failed to send message');
      }
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please log in to like items');
      return;
    }

    if (liked) {
      // 取消点赞
      try {
        const response = await axios.patch(`http://localhost:5000/api/items/${id}/unlike`, { 
          userId: currentUser.id 
        });
        setLikes(response.data.likes);
        setLiked(false);
      } catch (err) {
        alert('Failed to unlike this item');
      }
    } else {
      // 点赞
      try {
        const response = await axios.patch(`http://localhost:5000/api/items/${id}/like`, { 
          userId: currentUser.id 
        });
        setLikes(response.data.likes);
        setLiked(true);
      } catch (err) {
        alert('Failed to like this item');
      }
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!item) return <div className="container mt-5">Item not found</div>;

  return (
    <Container className="my-5">
      <Button variant="outline-primary" className="mb-4" onClick={() => navigate(-1)}>
        Back to Items
      </Button>

      <Row>
        <Col md={6}>
          {item.images && item.images.length > 0 && item.images[0] && (
            <img
              src={`http://localhost:5000/uploads/${item.images[0].replace(/^uploads[\\/]/, '')}`}
              alt={item.title}
              style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
            />
          )}
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="h2">{item.title}</Card.Title>
              <Card.Text className="h4 text-primary mb-4">
                ${item.price}
              </Card.Text>
              <Card.Text>
                <strong>Category:</strong> {item.category}
              </Card.Text>
              <Card.Text>
                <strong>Condition:</strong> {item.condition}
              </Card.Text>
              <Card.Text>
                <strong>Location:</strong> {item.location}
              </Card.Text>
              <Card.Text>
                <strong>Description:</strong>
                <br />
                {item.description}
              </Card.Text>
              <Card.Text>
                <strong>Posted by:</strong> {item.sellerName || (item.seller && item.seller.name)}
              </Card.Text>
              <Button
                variant={liked ? 'danger' : 'outline-danger'}
                size="md"
                className="mb-3"
                style={{ width: 120 }}
                onClick={handleLike}
              >
                {liked ? 'Liked' : 'Like'} ({likes})
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => setShowContactModal(true)}
              >
                Contact Seller
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Your Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message to the seller..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleContactSeller}>
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ItemDetail; 