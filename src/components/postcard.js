import React from "react"
import { Link } from "gatsby"

const PostCard = prop => {
  // (title, date, desc, tags)
  return (
    <div className="box">
      <article key={prop.title} className="content">
        <header>
          <h2 className="title">
            <Link style={{ boxShadow: `none` }} to={prop.slug}>
              {prop.title}
            </Link>
          </h2>
          <h6 className="subtitle">{prop.date}</h6>
        </header>
        <section>
          <p
            dangerouslySetInnerHTML={{
              __html: prop.desc,
            }}
          />
        </section>
      </article>
      <div className="tags">
        {prop.tags.map((tag, i) => (
          <Link key={i} to={"tag/" + tag} className="tag">
            {tag}
          </Link>
        ))}
      </div>
      {/* <Link className="hidelink" to={prop.slug}></Link> */}
    </div>
  )
}

export default PostCard
