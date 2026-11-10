export default function About() {
  return (
    <section className="section section--ink" aria-labelledby="why-title">
      <div className="wrap about">
        <div>
          <h2 id="why-title">Why we run</h2>
          <p>
            DJ Run began as a 37 km run in memory of DJ. Watch Me Rise has carried it on every year
            since, as a push to get people talking about mental health and to raise money for the
            South African Depression and Anxiety Group (SADAG).
          </p>
          <p>
            Our 2027 version is a family relay. One flag goes the whole 37 km, passed from hand to
            hand, so nobody carries it alone. That's the point.
          </p>
          <p className="about-links">
            <a href="https://watchmerise.co.za/dj-run/">Read the DJ Run story</a>
            <a href="https://watchmerise.co.za/donate/">Donate to SADAG through Watch Me Rise</a>
          </p>
        </div>

        <aside className="help" aria-labelledby="help-title">
          <h3 id="help-title">If you're struggling, talk to someone</h3>
          <p>
            SADAG's Suicide Crisis Helpline is free and open 24 hours:{' '}
            <a href="tel:0800567567" className="help-number">0800 567 567</a>
          </p>
          <p>
            More support lines at <a href="https://www.sadag.org/">sadag.org</a>.
          </p>
        </aside>
      </div>
    </section>
  );
}
