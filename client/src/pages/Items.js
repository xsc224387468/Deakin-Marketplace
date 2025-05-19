import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = "http://34.129.60.74";

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    status: 'all'
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await axios.get(`${API_BASE_URL}/api/items?${queryParams.toString()}`);
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items');
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <Container className="mt-5">Loading...</Container>;
  if (error) return <Container className="mt-5 text-danger">{error}</Container>;

  return (
    <Container className="mt-5">
      <Row>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h4>Filters</h4>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
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
                    value={filters.condition}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Condition</option>
                    <option value="new">New</option>
                    <option value="like new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                    <Form.Control
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Row>
            {items.length === 0 ? (
              <Col>
                <p>No items found matching your criteria.</p>
              </Col>
            ) : (
              items.map((item) => (
                <Col md={4} key={item._id} className="mb-4">
                  <Card>
                    {item.images && item.images.length > 0 && item.images[0] && (
                      <img
                        src={`${API_BASE_URL}/uploads/${item.images[0].replace(/^uploads[\\/]/, '')}`}
                        alt={item.title}
                        style={{ height: '200px', width: '100%', objectFit: 'cover', marginBottom: 12 }}
                      />
                    )}
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0">{item.title}</Card.Title>
                        <span className={`badge bg-${
                          item.status === 'Available' ? 'success' :
                          item.status === 'Pending' ? 'warning' : 'secondary'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <Card.Text className="text-truncate">{item.description}</Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">${item.price}</h5>
                        <Link to={`/items/${item._id}`}>
                          <Button variant="primary">View Details</Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Items; 