import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Messages() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser && (currentUser.id || currentUser._id)) {
            fetchMessages();
        }
        // eslint-disable-next-line
    }, [currentUser]);

    if (!currentUser || !(currentUser.id || currentUser._id)) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="warning">Please log in to view your messages.</Alert>
            </Container>
        );
    }

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError('');
            const userId = currentUser.id || currentUser._id;
            console.log('Fetching messages for user:', userId);
            const response = await axios.get(`http://localhost:5000/api/messages/user/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Messages response:', response.data);
            setMessages(response.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.message || 'Failed to fetch messages. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        if (
            !selectedConversation.item ||
            !selectedConversation.item._id ||
            !selectedConversation.otherUser ||
            !selectedConversation.otherUser._id
        ) {
            alert('Conversation data is invalid, please refresh the page.');
            return;
        }

        try {
            setError('');
            const senderId = currentUser.id || currentUser._id;
            const response = await axios.post('http://localhost:5000/api/messages', {
                itemId: selectedConversation.item._id,
                senderId: senderId,
                receiverId: selectedConversation.otherUser._id,
                content: newMessage.trim()
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Message sent successfully:', response.data);
            setMessages(prev => [response.data, ...prev]);
            setNewMessage('');
            fetchMessages(); // Refresh messages
        } catch (err) {
            console.error('Error sending message:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        }
    };

    const getConversationPartner = (message) => {
        return message.sender._id === (currentUser.id || currentUser._id) ? message.receiver : message.sender;
    };

    const getUniqueConversations = () => {
        const conversations = new Map();
        messages.forEach(message => {
            if (!message || !message.item || !message.sender || !message.receiver) {
                console.warn('Invalid message object:', message);
                return;
            }
            const otherUser = getConversationPartner(message);
            if (!otherUser) {
                console.warn('Could not determine conversation partner for message:', message);
                return;
            }
            const key = `${message.item._id}-${otherUser._id}`;
            if (!conversations.has(key)) {
                conversations.set(key, {
                    item: message.item,
                    otherUser: otherUser,
                    lastMessage: message,
                    unread: !message.read && message.receiver._id === (currentUser.id || currentUser._id)
                });
            }
        });
        return Array.from(conversations.values());
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        try {
            const userId = currentUser.id || currentUser._id;
            await axios.patch(`http://localhost:5000/api/messages/read/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchMessages(); // Refresh messages to update read status
        } catch (err) {
            console.error('Failed to mark messages as read:', err);
        }
    };

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
                        <Button variant="primary" onClick={fetchMessages}>Retry</Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    const conversations = getUniqueConversations();

    return (
        <Container className="mt-5">
            <Row>
                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h4 className="mb-0">Conversations</h4>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {conversations.length === 0 ? (
                                <ListGroup.Item>No conversations yet</ListGroup.Item>
                            ) : (
                                conversations.map((conversation, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        action
                                        active={selectedConversation && 
                                            selectedConversation.item._id === conversation.item._id &&
                                            selectedConversation.otherUser._id === conversation.otherUser._id}
                                        onClick={() => handleSelectConversation(conversation)}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">{conversation.item.title}</h6>
                                                <small className="text-muted">
                                                    with {conversation.otherUser.name}
                                                </small>
                                            </div>
                                            {conversation.unread && (
                                                <Badge bg="primary">New</Badge>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={8}>
                    {selectedConversation ? (
                        <Card>
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">{selectedConversation.item.title}</h5>
                                        <small className="text-muted">
                                            Conversation with {selectedConversation.otherUser.name}
                                        </small>
                                    </div>
                                    <Link to={`/items/${selectedConversation.item._id}`}>
                                        <Button variant="outline-primary" size="sm">
                                            View Item
                                        </Button>
                                    </Link>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="messages-container" style={{ height: '400px', overflowY: 'auto' }}>
                                    {messages
                                        .filter(m =>
                                            m &&
                                            m.item && m.item._id &&
                                            m.sender && m.sender._id &&
                                            m.receiver && m.receiver._id &&
                                            selectedConversation &&
                                            selectedConversation.item && selectedConversation.item._id &&
                                            selectedConversation.otherUser && selectedConversation.otherUser._id &&
                                            m.item._id === selectedConversation.item._id &&
                                            (m.sender._id === selectedConversation.otherUser._id ||
                                             m.receiver._id === selectedConversation.otherUser._id)
                                        )
                                        .map((message, index) => {
                                            const myId = String(currentUser.id || currentUser._id);
                                            const isMine = String(message.sender._id) === myId;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`message ${isMine ? 'text-end' : 'text-start'} mb-3`}
                                                >
                                                    <div
                                                        className={`d-inline-block p-2 rounded ${isMine ? 'bg-primary text-white' : 'bg-light'}`}
                                                    >
                                                        {message.content}
                                                    </div>
                                                    <small className="text-muted d-block">
                                                        {new Date(message.createdAt).toLocaleString()}
                                                    </small>
                                                </div>
                                            );
                                        })}
                                </div>
                                <Form onSubmit={handleSendMessage} className="mt-3">
                                    <Form.Group className="d-flex">
                                        <Form.Control
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                        />
                                        <Button type="submit" variant="primary" className="ms-2">
                                            Send
                                        </Button>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card>
                            <Card.Body className="text-center">
                                <h5>Select a conversation to start messaging</h5>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default Messages; 