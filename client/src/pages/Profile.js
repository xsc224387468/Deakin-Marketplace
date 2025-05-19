import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = "http://34.129.60.74";

function Profile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [userItems, setUserItems] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusLoading, setStatusLoading] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (currentUser.id) {
            fetchUserItems();
            fetchLikedItems();
        }
    }, [currentUser, navigate]);

    const fetchUserItems = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_BASE_URL}/api/items?seller=${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUserItems(response.data);
        } catch (err) {
            setError('Failed to fetch user data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLikedItems = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/items?likedBy=${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setLikedItems(response.data);
        } catch (err) {
            // optional error handling
        }
    };

    const handleStatusChange = async (itemId, newStatus) => {
        setStatusLoading(itemId + newStatus);
        try {
            await axios.patch(`${API_BASE_URL}/api/items/${itemId}/status`, { status: newStatus }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchUserItems();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setStatusLoading('');
        }
    };

    const renderStatusButton = (item) => {
        switch (item.status) {
            case 'Available':
                return (
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleStatusChange(item._id, 'Pending')}
                        disabled={statusLoading === item._id + 'Pending'}
                        className="me-2"
                    >
                        Mark as Pending
                    </Button>
                );
            case 'Pending':
                return (
                    <>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(item._id, 'Sold')}
                            disabled={statusLoading === item._id + 'Sold'}
                            className="me-2"
                        >
                            Mark as Sold
                        </Button>
                        <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleStatusChange(item._id, 'Available')}
                            disabled={statusLoading === item._id + 'Available'}
                            className="me-2"
                        >
                            Back to Available
                        </Button>
                    </>
                );
            case 'Sold':
                return (
                    <Button variant="success" size="sm" disabled>
                        Transaction Completed
                    </Button>
                );
            default:
                return null;
        }
    };

    if (!currentUser) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Please log in to view your profile.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button variant="primary" onClick={fetchUserItems}>Retry</Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    const avatarUrl = currentUser.profileImage
        ? (currentUser.profileImage.startsWith('http')
            ? currentUser.profileImage
            : `${API_BASE_URL}${currentUser.profileImage}`)
        : 'https://randomuser.me/api/portraits/men/32.jpg';

    return (
        <Container className="mt-5">
            <Row>
                <Col md={4}>
                    <Card className="mb-4 text-center">
                        <Card.Body>
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }}
                            />
                            <h3>Profile</h3>
                            <p><strong>Name:</strong> {currentUser.name}</p>
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>Phone:</strong> {currentUser.phone}</p>
                            <Link to="/settings">
                                <Button variant="primary">Edit Profile</Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>My Listings</h3>
                                <Link to="/sell">
                                    <Button variant="success">Sell New Item</Button>
                                </Link>
                            </div>
                            {userItems.length === 0 ? (
                                <p>You haven't listed any items yet.</p>
                            ) : (
                                <Row>
                                    {userItems.map(item => (
                                        <Col md={6} key={item._id} className="mb-4">
                                            <Card>
                                                {item.images && item.images.length > 0 && item.images[0] && (
                                                    <Card.Img
                                                        variant="top"
                                                        src={`${API_BASE_URL}/uploads/${item.images[0].replace(/^uploads[\\/]/, '')}`}
                                                        alt={item.title}
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <Card.Body>
                                                    <Card.Title>{item.title}</Card.Title>
                                                    <Card.Text>
                                                        <strong>Price:</strong> ${item.price}<br />
                                                        <strong>Status:</strong> <Badge bg={
                                                            item.status === 'Available' ? 'success' :
                                                                item.status === 'Pending' ? 'warning' : 'secondary'
                                                        }>{item.status}</Badge>
                                                    </Card.Text>
                                                    <div className="mb-2">
                                                        {renderStatusButton(item)}
                                                    </div>
                                                    <Link to={`/items/${item._id}`}>
                                                        <Button variant="primary">View Details</Button>
                                                    </Link>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <h3>Liked Items</h3>
                            {likedItems.length === 0 ? (
                                <p>You haven't liked any items yet.</p>
                            ) : (
                                <ListGroup>
                                    {likedItems.map(item => (
                                        <ListGroup.Item key={item._id} className="d-flex align-items-center">
                                            {item.images && item.images.length > 0 && item.images[0] && (
                                                <img
                                                    src={`${API_BASE_URL}/uploads/${item.images[0].replace(/^uploads[\\/]/, '')}`}
                                                    alt={item.title}
                                                    width={60}
                                                    height={60}
                                                    style={{ objectFit: 'cover', marginRight: 12 }}
                                                />
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div><strong>{item.title}</strong></div>
                                                <div>Price: ${item.price}</div>
                                            </div>
                                            <Link to={`/items/${item._id}`}>
                                                <Button variant="outline-primary" size="sm">View</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Profile;
