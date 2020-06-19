import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import PostCard from "../components/postcard"
import { rhythm } from "../utils/typography"

const PageIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  const count = posts.length

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Home" />
      <h1 className="title has-text-black is-1">Recent Blogs</h1>
      <hr />
      {posts.slice(0, 5).map(({ node }, i) => {
        const title = node.frontmatter.title || node.fields.slug
        return (
          <PostCard
            key={i}
            title={title}
            date={node.frontmatter.date}
            desc={node.excerpt}
            tags={node.frontmatter.tags}
            slug={node.fields.slug}
          />
        )
      })}
      {count > 5 ? (
        <Link className="button is-rounded" to="archive">
          More Posts
        </Link>
      ) : (
        <div></div>
      )}
    </Layout>
  )
}

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Home" />
      <Bio />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        return (
          <article key={node.fields.slug}>
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </h3>
              <small>{node.frontmatter.date}</small>
            </header>
            <section>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </section>
          </article>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tags
          }
        }
      }
    }
  }
`
