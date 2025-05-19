import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo.png" alt="Logo" style={{height:48, width:'auto', marginRight:12}} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/items">Browse Items</Nav.Link>
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/sell">Sell Item</Nav.Link>
                <Nav.Link as={Link} to="/messages">Messages</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 