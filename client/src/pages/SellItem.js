import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const SellItem = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    image: null,
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentUser || !currentUser._id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('images', formData.image);
      formDataToSend.append('seller', currentUser.id);
      formDataToSend.append('location', formData.location);

      console.log('Sending data:', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        condition: formData.condition,
        seller: currentUser.id,
        location: formData.location
      });

      const response = await axios.post('http://localhost:5000/api/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data) {
        navigate(`/items/${response.data._id}`);
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Sell an Item</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter item title"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe your item"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="textbooks">Textbooks</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="new">New</option>
                    <option value="like new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Image</Form.Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="custom-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      style={{ display: 'none' }}
                    />
                    <Button variant="outline-primary" onClick={() => document.getElementById('custom-file-input').click()}>
                      Choose Image
                    </Button>
                    <span>{formData.image ? formData.image.name : 'No file chosen'}</span>
                  </div>
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Expected transaction location"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating Listing...' : 'Create Listing'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SellItem; 