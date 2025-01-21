import { FiMail, FiPhone, FiMessageCircle, FiLinkedin, FiTwitter } from 'solid-icons/fi';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class={styles.footer}>
      <div class={styles.footerContent}>
        <div class={styles.footerSection}>
          <h4>Agent Support</h4>
          <div class={styles.supportLinks}>
            <a href="mailto:support@travelagent.com" class={styles.supportLink}>
              <FiMail />
              <span>support@travelagent.com</span>
            </a>
            <a href="tel:1-800-123-4567" class={styles.supportLink}>
              <FiPhone />
              <span>1-800-123-4567</span>
            </a>
            <button class={styles.supportLink}>
              <FiMessageCircle />
              <span>Start Live Chat</span>
            </button>
          </div>
        </div>

        <div class={styles.footerSection}>
          <h4>Legal</h4>
          <div class={styles.legalLinks}>
            <a href="/terms">Terms & Conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/compliance">Compliance</a>
            <a href="/gdpr">GDPR</a>
          </div>
        </div>

        <div class={styles.footerSection}>
          <h4>Connect With Us</h4>
          <div class={styles.socialLinks}>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FiLinkedin />
              <span>LinkedIn</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FiTwitter />
              <span>Twitter</span>
            </a>
          </div>
        </div>
      </div>

      <div class={styles.footerBottom}>
        <p>&copy; {currentYear} Travel Agent Portal. All rights reserved.</p>
        <div class={styles.footerBottomLinks}>
          <a href="/sitemap">Sitemap</a>
          <span>|</span>
          <a href="/accessibility">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 