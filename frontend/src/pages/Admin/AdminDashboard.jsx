import React, { useState } from 'react';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { PersonFill, ChatDotsFill, TagsFill } from 'react-bootstrap-icons';
import UserManagement from './UserManagement';

import PostManagement from './PostManagement';
import GenreTopicManagement from './GenreTopicManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'genres':
        return <GenreTopicManagement />;
      case 'posts':
        return <PostManagement />;
      default:
        return null;
    }
  };

  return (
    <Container fluid className="my-5 px-4">
      <Row className="g-4">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2}>
          <Card className="bg-dark border-0 shadow-sm rounded-3">
            <Card.Header className="bg-primary text-light fs-5 fw-bold text-center rounded-top">
              Menu Admin
            </Card.Header>
            <Nav
              variant="pills"
              className="flex-md-column px-2 py-3"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item className="mb-3">
                <Nav.Link
                  eventKey="users"
                  className="d-flex align-items-center gap-2 text-light"
                  style={{ fontWeight: activeTab === 'users' ? '700' : '400' }}
                >
                  <PersonFill size={20} />
                  Gestion Utilisateurs
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="mb-3">
                <Nav.Link
                  eventKey="genres"
                  className="d-flex align-items-center gap-2 text-light"
                  style={{ fontWeight: activeTab === 'genres' ? '700' : '400' }}
                >
                  <TagsFill size={20} />
                  Gestion des Genres
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="posts"
                  className="d-flex align-items-center gap-2 text-light"
                  style={{ fontWeight: activeTab === 'posts' ? '700' : '400' }}
                >
                  <ChatDotsFill size={20} />
                  Gestion des publications
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card>
        </Col>

        {/* Main content */}
        <Col xs={12} md={9} lg={10}>
          <Card className="bg-dark border-0 shadow-sm rounded-3">
            <Card.Header className="bg-primary text-light fs-4 fw-bold rounded-top px-4 py-3 text-center text-shadow">
              {activeTab === 'users' && 'Gestion Utilisateurs'}
              {activeTab === 'genres' && 'Gestion des Genres'}
              {activeTab === 'posts' && 'Gestion des publications'}
            </Card.Header>
            <Card.Body className="p-4">{renderContent()}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
