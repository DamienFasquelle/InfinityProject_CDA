import React, { useState } from 'react';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import UserManagement from './UserManagement';
import TopicManagement from './TopicManagement';
import PostManagement from './PostManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Menu secondaire */}
        <Col xs={12} md={3} lg={2} className="mb-3">
          <Card>
            <Card.Header className="bg-info text-white">Menu Admin</Card.Header>
            <Nav
              variant="pills"
              className="flex-md-column"
              activeKey={activeTab}
              onSelect={(selectedKey) => setActiveTab(selectedKey)}
            >
              <Nav.Item>
                <Nav.Link eventKey="users">Gestion Utilisateurs</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="topics">Gestion Topics</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="posts">Gestion Posts</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card>
        </Col>

        {/* Contenu dynamique */}
        <Col xs={12} md={9} lg={10}>
          <Card>
            <Card.Header className="bg-info text-white">
              {activeTab === 'users' && 'Gestion Utilisateurs'}
              {activeTab === 'topics' && 'Gestion Topics'}
              {activeTab === 'posts' && 'Gestion Posts'}
            </Card.Header>
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'topics' && <TopicManagement />}
            {activeTab === 'posts' && <PostManagement />}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
