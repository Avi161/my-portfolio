import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const MyNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home">My Website</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#about-myself">About Myself</Nav.Link>
            <Nav.Link href="#skills">Skills</Nav.Link> {/* Added Skills */}
            <Nav.Link href="#projects">Projects</Nav.Link>
            <Nav.Link href="#hobbies">Hobbies</Nav.Link>
            <Nav.Link href="#contact-me">Contact Me</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
