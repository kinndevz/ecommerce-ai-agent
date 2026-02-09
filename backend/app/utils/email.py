import smtplib
import os
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from jinja2 import Environment, FileSystemLoader

from app.core.config import settings
BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


def send_email_smtp(to_email: str, subject: str, html_body: str):
    """
    Send email using SMTP (Gmail)
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        # Attach HTML body
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)

        # Connect and send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()  # Enable TLS
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        raise


def render_template(template_name: str, context: dict):
    """Hàm helper để đọc file HTML và điền dữ liệu"""
    try:
        template = env.get_template(template_name)
        return template.render(**context)
    except Exception as e:
        print(f"Error rendering template {template_name}: {e}")
        return ""


def send_otp_email(email: str, code: str):
    """Send OTP email via SMTP"""
    subject = f"Your OTP Code - {settings.APP_NAME}"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center;
                    font-size: 32px; font-weight: bold; letter-spacing: 5px;
                    border-radius: 8px; margin: 20px 0;">
            {code}
        </div>
        <p>This code will expire in <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong>.</p>
        <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">
            This is an automated email from {settings.APP_NAME}. Please do not reply.
        </p>
    </div>
    """

    send_email_smtp(email, subject, html_body)


def send_order_confirmation_email(to_email: str, order_data: dict):
    """
    Gửi email hóa đơn dùng template HTML.
    order_data nhận vào từ Service cần có các key:
    - full_name
    - order_number
    - items: List[{name, quantity, price}]
    - total_amount
    """
    subject = f"Xác nhận đơn hàng #{order_data.get('order_number')}"

    # Render ra HTML string từ file invoice.html
    html_body = render_template("invoice.html", order_data)

    if html_body:
        send_email_smtp(to_email, subject, html_body)
    else:
        print("Failed to render invoice template")


def send_welcome_email(email: str, full_name: str):
    """Send welcome email after registration"""
    subject = f"Welcome to {settings.APP_NAME}!"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>👋 Welcome {full_name}!</h2>
        <p>Thank you for joining {settings.APP_NAME}.</p>
        <p>Start exploring our amazing cosmetic products!</p>
        <a href="https://yourwebsite.com"
           style="display: inline-block; padding: 12px 24px; background: #4CAF50;
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Start Shopping
        </a>
        <p>If you have any questions, feel free to contact our support team.</p>
    </div>
    """

    send_email_smtp(email, subject, html_body)


def send_password_reset_email(email: str, reset_code: str):
    """Send password reset email"""
    subject = "Password Reset Request"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🔒 Password Reset Request</h2>
        <p>You requested to reset your password. Use the code below:</p>
        <div style="background-color: #fff3cd; padding: 20px; text-align: center;
                    font-size: 32px; font-weight: bold; letter-spacing: 5px;
                    border-radius: 8px; margin: 20px 0; border: 2px solid #ffc107;">
            {reset_code}
        </div>
        <p>This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
        <p style="color: #dc3545;">⚠️ If you didn't request this, please ignore this email and
           consider changing your password.</p>
    </div>
    """

    send_email_smtp(email, subject, html_body)
