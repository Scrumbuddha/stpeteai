import csv
import io
import os
import re
from datetime import datetime, date
from flask import (Flask, render_template, request, redirect, url_for,
                   session, flash, Response)
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'stpeteai-dev-secret-2026')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///stpeteai.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'stpeteai2026')

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[],
    storage_uri='memory://',
)

ALLOWED_TIERS = {'community', 'supporter', 'champion'}
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

db = SQLAlchemy(app)


# ── Models ────────────────────────────────────────────────────────────────

class Member(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(200), nullable=False)
    tier       = db.Column(db.String(30), nullable=False)
    message    = db.Column(db.Text, default='')
    status     = db.Column(db.String(20), default='pending')  # pending / active / inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Event(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    event_date  = db.Column(db.Date, nullable=False)
    time_str    = db.Column(db.String(30), default='')
    location    = db.Column(db.String(100), default='Online')
    badge       = db.Column(db.String(30), default='online')  # online / workshop / free
    active      = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)


class ContactMessage(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(200), nullable=False)
    subject    = db.Column(db.String(100), default='General')
    message    = db.Column(db.Text, nullable=False)
    read       = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ── Seed data ─────────────────────────────────────────────────────────────

def seed_events():
    if Event.query.count() == 0:
        seeds = [
            Event(title='Support Anthropic — AI Safety Discussion',
                  description='Open conversation on AI alignment, safety research, and what it means to build responsibly.',
                  event_date=date(2026, 3, 3), time_str='6:30 PM EST',
                  location='Online', badge='online'),
            Event(title='Building Multi-Agent Workflows with Claude Code',
                  description='Hands-on session building real agent pipelines using Anthropic\'s Claude Code tooling.',
                  event_date=date(2026, 3, 2), time_str='6:30 PM EST',
                  location='Online', badge='workshop'),
            Event(title='2-Hour AI Art Lab',
                  description='Creative session with Midjourney and generative tools — no coding required.',
                  event_date=date(2026, 1, 10), time_str='10:30 AM EST',
                  location='Online', badge='online'),
        ]
        db.session.add_all(seeds)
        db.session.commit()


# ── Admin decorator ───────────────────────────────────────────────────────

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated


# ── Public routes ─────────────────────────────────────────────────────────

@app.route('/')
def index():
    events = (Event.query
              .filter_by(active=True)
              .order_by(Event.event_date.desc())
              .limit(3).all())
    return render_template('index.html', events=events)


@app.route('/sitemap.xml')
def sitemap():
    from flask import Response
    pages = [
        ('https://www.stpeteai.org/',               '2026-03-09', 'weekly',  '1.0'),
        ('https://www.stpeteai.org/#mission',        '2026-03-09', 'monthly', '0.8'),
        ('https://www.stpeteai.org/#programs',       '2026-03-09', 'monthly', '0.8'),
        ('https://www.stpeteai.org/#membership',     '2026-03-09', 'monthly', '0.9'),
        ('https://www.stpeteai.org/#meetup',         '2026-03-09', 'weekly',  '0.8'),
        ('https://www.stpeteai.org/#claudes-brain',  '2026-03-09', 'monthly', '0.7'),
        ('https://www.stpeteai.org/#contact',        '2026-03-09', 'yearly',  '0.6'),
    ]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod, changefreq, priority in pages:
        xml.append(f'  <url>')
        xml.append(f'    <loc>{loc}</loc>')
        xml.append(f'    <lastmod>{lastmod}</lastmod>')
        xml.append(f'    <changefreq>{changefreq}</changefreq>')
        xml.append(f'    <priority>{priority}</priority>')
        xml.append(f'  </url>')
    xml.append('</urlset>')
    return Response('\n'.join(xml), mimetype='application/xml')


@app.route('/robots.txt')
def robots():
    from flask import Response
    content = (
        'User-agent: *\n'
        'Allow: /\n'
        'Disallow: /admin\n'
        '\n'
        'Sitemap: https://www.stpeteai.org/sitemap.xml\n'
    )
    return Response(content, mimetype='text/plain')


@app.route('/join', methods=['POST'])
@limiter.limit('5 per minute; 20 per hour', error_message='Too many requests. Please try again later.')
def join():
    # Honeypot — bots fill this hidden field, humans don't
    if request.form.get('h_field', ''):
        return redirect('/#membership')

    name    = request.form.get('name', '').strip()[:120]
    email   = request.form.get('email', '').strip()[:200]
    tier    = request.form.get('tier', 'community').strip()
    message = request.form.get('message', '').strip()[:1000]

    if not name or not email:
        flash('Please fill in your name and email.', 'error')
        return redirect('/#membership')

    if not EMAIL_RE.match(email):
        flash('Please enter a valid email address.', 'error')
        return redirect('/#membership')

    if tier not in ALLOWED_TIERS:
        tier = 'community'

    member = Member(name=name, email=email, tier=tier, message=message)
    db.session.add(member)
    db.session.commit()

    labels = {'community': 'Community', 'supporter': 'Supporter', 'champion': 'Champion'}
    flash(f"Welcome, {name}! Your {labels.get(tier, tier)} membership request has been received. We'll be in touch at {email}.", 'success')
    return redirect('/#membership')


@app.route('/contact', methods=['POST'])
@limiter.limit('5 per minute; 20 per hour', error_message='Too many requests. Please try again later.')
def contact():
    # Honeypot
    if request.form.get('h_field', ''):
        return redirect('/#contact')

    name    = request.form.get('name', '').strip()[:120]
    email   = request.form.get('email', '').strip()[:200]
    subject = request.form.get('subject', 'General').strip()[:100]
    message = request.form.get('message', '').strip()[:2000]

    if not name or not email or not message:
        flash('Please fill in all required fields.', 'error')
        return redirect('/#contact')

    if not EMAIL_RE.match(email):
        flash('Please enter a valid email address.', 'error')
        return redirect('/#contact')

    msg = ContactMessage(name=name, email=email, subject=subject, message=message)
    db.session.add(msg)
    db.session.commit()

    flash(f"Thanks, {name}! Your message has been received. We'll reply to {email} shortly.", 'success')
    return redirect('/#contact')


# ── Admin auth ────────────────────────────────────────────────────────────

@app.route('/admin')
def admin_root():
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    error = None
    if request.method == 'POST':
        if request.form.get('password') == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        error = 'Incorrect password.'
    return render_template('admin/login.html', error=error)


@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))


# ── Admin dashboard ───────────────────────────────────────────────────────

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    member_count   = Member.query.count()
    event_count    = Event.query.filter_by(active=True).count()
    unread_count   = ContactMessage.query.filter_by(read=False).count()
    recent_members = Member.query.order_by(Member.created_at.desc()).limit(5).all()
    return render_template('admin/dashboard.html',
                           member_count=member_count,
                           event_count=event_count,
                           unread_count=unread_count,
                           recent_members=recent_members)


# ── Admin members ─────────────────────────────────────────────────────────

@app.route('/admin/members')
@admin_required
def admin_members():
    tier   = request.args.get('tier', 'all')
    status = request.args.get('status', 'all')
    q = Member.query
    if tier != 'all':
        q = q.filter_by(tier=tier)
    if status != 'all':
        q = q.filter_by(status=status)
    members = q.order_by(Member.created_at.desc()).all()
    return render_template('admin/members.html', members=members,
                           active_tier=tier, active_status=status)


@app.route('/admin/members/export')
@admin_required
def admin_members_export():
    tier   = request.args.get('tier', 'all')
    status = request.args.get('status', 'all')
    q = Member.query
    if tier != 'all':
        q = q.filter_by(tier=tier)
    if status != 'all':
        q = q.filter_by(status=status)
    members = q.order_by(Member.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Name', 'Email', 'Tier', 'Status', 'Message', 'Joined'])
    for m in members:
        writer.writerow([
            m.name, m.email, m.tier, m.status,
            m.message or '',
            m.created_at.strftime('%Y-%m-%d %H:%M') if m.created_at else '',
        ])
    output.seek(0)
    filename = 'members'
    if tier != 'all':
        filename += f'-{tier}'
    if status != 'all':
        filename += f'-{status}'
    filename += '.csv'
    return Response(output.getvalue(), mimetype='text/csv',
                    headers={'Content-Disposition': f'attachment; filename={filename}'})


@app.route('/admin/members/<int:mid>/status', methods=['POST'])
@admin_required
def admin_member_status(mid):
    member = Member.query.get_or_404(mid)
    member.status = request.form.get('status', member.status)
    db.session.commit()
    return redirect(url_for('admin_members'))


@app.route('/admin/members/<int:mid>/delete', methods=['POST'])
@admin_required
def admin_member_delete(mid):
    member = Member.query.get_or_404(mid)
    db.session.delete(member)
    db.session.commit()
    flash(f'Member {member.name} deleted.', 'info')
    return redirect(url_for('admin_members'))


@app.route('/admin/members/bulk', methods=['POST'])
@admin_required
def admin_members_bulk():
    action = request.form.get('action')
    ids = request.form.getlist('selected_ids')
    if not ids:
        flash('No members selected.', 'error')
        return redirect(url_for('admin_members'))
    members = Member.query.filter(Member.id.in_([int(i) for i in ids])).all()
    if action == 'delete':
        for m in members:
            db.session.delete(m)
        db.session.commit()
        flash(f'Deleted {len(members)} member(s).', 'info')
    elif action in ('active', 'inactive', 'pending'):
        for m in members:
            m.status = action
        db.session.commit()
        flash(f'Set {len(members)} member(s) to {action}.', 'success')
    else:
        flash('Unknown action.', 'error')
    return redirect(url_for('admin_members'))


# ── Admin events ──────────────────────────────────────────────────────────

@app.route('/admin/events')
@admin_required
def admin_events():
    events = Event.query.order_by(Event.event_date.desc()).all()
    return render_template('admin/events.html', events=events)


@app.route('/admin/events/new', methods=['GET', 'POST'])
@admin_required
def admin_event_new():
    if request.method == 'POST':
        event = Event(
            title       = request.form['title'].strip(),
            description = request.form.get('description', '').strip(),
            event_date  = datetime.strptime(request.form['event_date'], '%Y-%m-%d').date(),
            time_str    = request.form.get('time_str', '').strip(),
            location    = request.form.get('location', 'Online').strip(),
            badge       = request.form.get('badge', 'online'),
            active      = 'active' in request.form,
        )
        db.session.add(event)
        db.session.commit()
        flash(f'Event "{event.title}" created.', 'success')
        return redirect(url_for('admin_events'))
    return render_template('admin/event_form.html', event=None, action='New')


@app.route('/admin/events/<int:eid>/edit', methods=['GET', 'POST'])
@admin_required
def admin_event_edit(eid):
    event = Event.query.get_or_404(eid)
    if request.method == 'POST':
        event.title       = request.form['title'].strip()
        event.description = request.form.get('description', '').strip()
        event.event_date  = datetime.strptime(request.form['event_date'], '%Y-%m-%d').date()
        event.time_str    = request.form.get('time_str', '').strip()
        event.location    = request.form.get('location', 'Online').strip()
        event.badge       = request.form.get('badge', 'online')
        event.active      = 'active' in request.form
        db.session.commit()
        flash(f'Event "{event.title}" updated.', 'success')
        return redirect(url_for('admin_events'))
    return render_template('admin/event_form.html', event=event, action='Edit')


@app.route('/admin/events/<int:eid>/delete', methods=['POST'])
@admin_required
def admin_event_delete(eid):
    event = Event.query.get_or_404(eid)
    db.session.delete(event)
    db.session.commit()
    flash(f'Event "{event.title}" deleted.', 'info')
    return redirect(url_for('admin_events'))


@app.route('/admin/events/<int:eid>/toggle', methods=['POST'])
@admin_required
def admin_event_toggle(eid):
    event = Event.query.get_or_404(eid)
    event.active = not event.active
    db.session.commit()
    return redirect(url_for('admin_events'))


# ── Admin contacts ────────────────────────────────────────────────────────

@app.route('/admin/contacts')
@admin_required
def admin_contacts():
    contacts = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return render_template('admin/contacts.html', contacts=contacts)


@app.route('/admin/contacts/<int:cid>/read', methods=['POST'])
@admin_required
def admin_contact_read(cid):
    msg = ContactMessage.query.get_or_404(cid)
    msg.read = not msg.read
    db.session.commit()
    return redirect(url_for('admin_contacts'))


@app.route('/admin/contacts/<int:cid>/delete', methods=['POST'])
@admin_required
def admin_contact_delete(cid):
    msg = ContactMessage.query.get_or_404(cid)
    db.session.delete(msg)
    db.session.commit()
    return redirect(url_for('admin_contacts'))


# ── Bootstrap ─────────────────────────────────────────────────────────────

def _ensure_database():
    """If using PostgreSQL, create the database if it doesn't exist yet."""
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url.startswith('postgresql'):
        return
    try:
        import psycopg2
        from urllib.parse import urlparse
        p = urlparse(db_url)
        conn = psycopg2.connect(
            host=p.hostname, port=p.port or 5432,
            user=p.username, password=p.password,
            dbname='postgres'
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (p.path.lstrip('/'),))
        if not cur.fetchone():
            cur.execute(f'CREATE DATABASE "{p.path.lstrip("/")}"')
        cur.close()
        conn.close()
    except Exception as e:
        print(f'[db init] {e}')

_ensure_database()

with app.app_context():
    db.create_all()
    seed_events()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
