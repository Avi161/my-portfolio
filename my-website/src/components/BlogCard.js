import React from 'react';
// Assuming BlogCard specific styles could be in BlogCard.css or covered by Blogs.css
// If './Blogs.css' is a typo and should be '../styles/Blogs.css', adjust as needed.
// For now, let's assume it's correctly referring to a CSS file at the same level or handled by build process.
import '../styles/Blogs.css'; // Corrected path if it was referring to the global Blogs.css

const BlogCard = ({ title, image, excerpt, link }) => { // Added link prop
  const imageSrc = image || '/blog/placeholder.jpg';
  const altText = image ? title : `${title} - Placeholder Image`;

  return (
    <div className="blog-card">
      <img src={imageSrc} alt={altText} className="blog-image" />
      {/* Changed h2 to h3 to match CSS selectors used in Blogs.css */}
      <h3 className="blog-title">{title}</h3>
      <p className="blog-excerpt">{excerpt}</p>
      {/* Added a Read More link, assuming 'link' prop will be passed from BlogsPage */}
      {link && (
        <a href={link} className="read-more-link">Read More</a>
      )}
    </div>
  );
};

export default BlogCard;