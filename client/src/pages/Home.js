import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [hotItems, setHotItems] = useState([]);

  useEffect(() => {
    const fetchHotItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items?status=Available');
        // 按 likes 降序排序，取前3个
        const sorted = response.data.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        setHotItems(sorted.slice(0, 3));
      } catch (err) {
        setHotItems([]);
      }
    };
    fetchHotItems();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 hero-section" style={{background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}}>
        <Container>
          <Row className="align-items-center">
            <Col md={7} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-3">Welcome to Deakin Marketplace</h1>
              <p className="lead mb-4">
                Buy and sell second-hand items with fellow Deakin students
              </p>
              <Button as={Link} to="/items" variant="light" size="lg" className="shadow-sm px-4 py-2 fw-semibold">
                Browse Items
              </Button>
            </Col>
            <Col md={5} className="d-none d-md-block text-center">
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%'}}>
                <img src="/home1.png" alt="Home1" style={{maxWidth:'180px', width:'100%', marginBottom:16, borderRadius:12, boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}} />
                <img src="/home2.png" alt="Home2" style={{maxWidth:'180px', width:'100%', borderRadius:12, boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}} />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Hot Items */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Hot Items</h2>
        <Row className="justify-content-center">
          {hotItems.length === 0 && (
            <div className="text-center text-muted mb-4">No hot items yet.</div>
          )}
          {hotItems.map(item => (
            <Col key={item._id} md={4} sm={6} xs={12} className="mb-4">
              <Card className="hot-item-card text-center h-100">
                <Card.Body>
                  {item.images && item.images.length > 0 && (
                    <img src={`http://localhost:5000/uploads/${item.images[0].replace(/^uploads[\\/]/, '')}`} alt={item.title} style={{height:120, objectFit:'contain', marginBottom:12, maxWidth:'100%'}} />
                  )}
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>${item.price}</Card.Text>
                  <div className="mb-2" style={{color:'#e0245e', fontSize:18}}>
                    Likes: {item.likes || 0}
                  </div>
                  <Button as={Link} to={`/items/${item._id}`} variant="outline-primary">View</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Featured Categories */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Featured Categories</h2>
        <Row>
          <Col md={3} className="mb-4 h-100">
            <Card className="category-card shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold">Textbooks</Card.Title>
                <Card.Text>
                  Find your course textbooks at affordable prices
                </Card.Text>
                <Button variant="primary" as={Link} to="/items?category=textbooks">
                  View
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4 h-100">
            <Card className="category-card shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold">Electronics</Card.Title>
                <Card.Text>
                  Phones, computers, and other tech items
                </Card.Text>
                <Button variant="primary" as={Link} to="/items?category=electronics">
                  Browse
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4 h-100">
            <Card className="category-card shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold">Furniture</Card.Title>
                <Card.Text>
                  Dorm and apartment furniture
                </Card.Text>
                <Button variant="primary" as={Link} to="/items?category=furniture">
                  Browse
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4 h-100">
            <Card className="category-card shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold">Other</Card.Title>
                <Card.Text>
                  Various student essentials
                </Card.Text>
                <Button variant="primary" as={Link} to="/items?category=other">
                  Browse
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home; 