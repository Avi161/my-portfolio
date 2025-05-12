import React from 'react';
import { Link } from 'react-router-dom';
import MyNavbar from '../components/MyNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Add this line
import './BlogPostPage.css';

const BlogsPage = ({}) => {
  return (
    <>
      <MyNavbar 
        activeSection="blogs"
        darkMode={false} // Force navbar to be light mode
      />
      <div className="light-mode-blog">
        <div class="blog-page py-5">
          <h1 class="text-center my-5">Welcome to my Blog</h1>
          <section>
            {/* My Family */}
            <div class="container">
              <div class="about-me">
                <h2>My Family</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris in odio congue, rutrum massa non, tristique mauris. Pellentesque ac nisi sed metus placerat tristique. Proin efficitur, velit in iaculis tristique, nisi mi egestas erat, id tristique nisl est id ex. Nam rutrum vitae elit eget aliquet. Mauris lectus metus, ornare sit amet facilisis malesuada, sollicitudin ut mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus in feugiat est. Morbi tincidunt magna ac congue vehicula. Cras ornare ornare lorem ac luctus. In et urna a eros pharetra placerat. Morbi sed varius metus. Vestibulum sodales magna sem, et cursus lectus egestas quis. Pellentesque consequat eleifend semper. Nam ac varius eros. Donec vitae lacus erat. Sed ipsum dolor, maximus eu enim sit amet, fringilla imperdiet mi.
                Ut vitae sapien nisi. Suspendisse efficitur massa ultricies, hendrerit lectus a, finibus nibh. Sed vel finibus libero, quis sollicitudin turpis. Vivamus tincidunt metus at tristique consectetur. Morbi non lorem ultrices, ullamcorper nisi vel, placerat libero. Vivamus cursus eget risus eu lacinia. Aenean quis nisl at orci ullamcorper vehicula. Pellentesque nec maximus dui.</p>
                <ul>
                  <li>Hi</li>
                  <li>Hello</li>
                </ul>
                <div id="carouselExampleCaptions" className="carousel slide my-5">
                  <div class="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="3" aria-label="Slide 4"></button>
                  </div>
                  <div class="carousel-inner">
                    <div class="carousel-item active">
                      <img src={`${process.env.PUBLIC_URL}/blog/FamilyJapan.png`}  class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>First slide label</h5>
                        <p>Some representative placeholder content for the first slide.</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src={`${process.env.PUBLIC_URL}/blog/FamilyHumla.jpg`} class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>Second slide label</h5>
                        <p>Some representative placeholder content for the second slide.</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src={`${process.env.PUBLIC_URL}/blog/AviAyushma.jpg`} class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>Third slide label</h5>
                        <p>Some representative placeholder content for the third slide.</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src={`${process.env.PUBLIC_URL}/blog/BigFamily.png`} class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>Third slide label</h5>
                        <p>Some representative placeholder content for the third slide.</p>
                      </div>
                    </div>
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section>
            {/*My Friends*/}
            <div class="container">
              <div class="about-me">
                <h2>My Friends</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris in odio congue, rutrum massa non, tristique mauris. Pellentesque ac nisi sed metus placerat tristique. Proin efficitur, velit in iaculis tristique, nisi mi egestas erat, id tristique nisl est id ex. Nam rutrum vitae elit eget aliquet. Mauris lectus metus, ornare sit amet facilisis malesuada, sollicitudin ut mi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus in feugiat est. Morbi tincidunt magna ac congue vehicula. Cras ornare ornare lorem ac luctus. In et urna a eros pharetra placerat. Morbi sed varius metus. Vestibulum sodales magna sem, et cursus lectus egestas quis. Pellentesque consequat eleifend semper. Nam ac varius eros. Donec vitae lacus erat. Sed ipsum dolor, maximus eu enim sit amet, fringilla imperdiet mi.
                Ut vitae sapien nisi. Suspendisse efficitur massa ultricies, hendrerit lectus a, finibus nibh. Sed vel finibus libero, quis sollicitudin turpis. Vivamus tincidunt metus at tristique consectetur. Morbi non lorem ultrices, ullamcorper nisi vel, placerat libero. Vivamus cursus eget risus eu lacinia. Aenean quis nisl at orci ullamcorper vehicula. Pellentesque nec maximus dui.</p>
                <ul>
                  <li>Hi</li>
                  <li>Hello</li>
                </ul>
                <div id="carouselFriends" className="carousel slide my-5">
                  <div class="carousel-indicators">
                    <button type="button" data-bs-target="#carouselFriends" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselFriends" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carouselFriends" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    <button type="button" data-bs-target="#carouselFriends" data-bs-slide-to="3" aria-label="Slide 4"></button>
                  </div>
                  <div class="carousel-inner">
                    <div class="carousel-item active">
                      <img src={`${process.env.PUBLIC_URL}/blog/UnionFriends.jpg`}  class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>First slide label</h5>
                        <p>Some representative placeholder content for the first slide.</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src={`${process.env.PUBLIC_URL}/blog/HsFriendsSwimming.jpg`} class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>Second slide label</h5>
                        <p>Some representative placeholder content for the second slide.</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src={`${process.env.PUBLIC_URL}/blog/WheatGolub.jpg`} class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>Third slide label</h5>
                        <p>Some representative placeholder content for the third slide.</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src={`${process.env.PUBLIC_URL}/blog/HsFriendsPDS.jpg`} class="d-block w-100" alt="..."/>
                      <div class="carousel-caption d-none d-md-block">
                        <h5>Third slide label</h5>
                        <p>Some representative placeholder content for the third slide.</p>
                      </div>
                    </div>
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#carouselFriends" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#carouselFriends" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default BlogsPage;