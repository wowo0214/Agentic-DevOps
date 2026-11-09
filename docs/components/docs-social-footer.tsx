'use client';

import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { FaGithub, FaLinkedinIn, FaSlack, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { gitConfig } from '@/lib/shared';

// Supply the site's own social URLs here when they are available.
const socials = [
  {
    label: 'GitHub',
    icon: FaGithub,
    url: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  },
  { label: 'Slack', icon: FaSlack, url: undefined },
  { label: 'LinkedIn', icon: FaLinkedinIn, url: undefined },
  { label: 'X', icon: FaXTwitter, url: undefined },
  { label: 'YouTube', icon: FaYoutube, url: undefined },
];

export function DocsSocialFooter() {
  return (
    <div className="docs-social-footer">
      <nav aria-label="Social links" className="docs-social-links">
        {socials.map(({ label, icon: Icon, url }) =>
          url ? (
            <a key={label} href={url} aria-label={label} target="_blank" rel="noreferrer noopener">
              <Icon aria-hidden="true" />
            </a>
          ) : (
            <button key={label} type="button" disabled aria-label={label}>
              <Icon aria-hidden="true" />
            </button>
          ),
        )}
      </nav>
      <ThemeSwitch className="docs-theme-switch" />
    </div>
  );
}
