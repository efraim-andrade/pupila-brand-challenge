import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from '../Badge';

const PRIMARY_COLOR_HEX = '#ff0000';
const BADGE_TEXT = 'Skill Tag';
const CUSTOM_CLASS_NAME = 'custom-class';
const REMOVE_BUTTON_NAME = 'Remove';

beforeEach(() => jest.clearAllMocks());

describe('Badge', () => {
  describe('content rendering', () => {
    it('renders children text', () => {
      render(<Badge>{BADGE_TEXT}</Badge>);

      expect(screen.getByText(BADGE_TEXT)).toBeInTheDocument();
    });
  });

  describe('color prop', () => {
    it('applies backgroundColor derived from the color hex when color is provided', () => {
      render(<Badge color={PRIMARY_COLOR_HEX}>{BADGE_TEXT}</Badge>);

      const badgeElement = screen.getByText(BADGE_TEXT);
      expect(badgeElement).toHaveStyle({
        backgroundColor: `${PRIMARY_COLOR_HEX}22`,
      });
    });

    it('applies borderColor derived from the color hex when color is provided', () => {
      render(<Badge color={PRIMARY_COLOR_HEX}>{BADGE_TEXT}</Badge>);

      const badgeElement = screen.getByText(BADGE_TEXT);
      expect(badgeElement).toHaveStyle({
        borderColor: `${PRIMARY_COLOR_HEX}44`,
      });
    });

    it('sets the color CSS property to the exact hex value when color is provided', () => {
      render(<Badge color={PRIMARY_COLOR_HEX}>{BADGE_TEXT}</Badge>);

      const badgeElement = screen.getByText(BADGE_TEXT);
      expect(badgeElement).toHaveStyle({ color: PRIMARY_COLOR_HEX });
    });

    it('applies default Vercel-style classes when color is not provided', () => {
      render(<Badge>{BADGE_TEXT}</Badge>);

      const badgeElement = screen.getByText(BADGE_TEXT);
      expect(badgeElement).toHaveClass('bg-badge-bg', 'text-badge-text');
    });
  });

  describe('remove button', () => {
    it('renders a Remove button when onRemove is provided', () => {
      const handleRemoveBadge = jest.fn();
      render(<Badge onRemove={handleRemoveBadge}>{BADGE_TEXT}</Badge>);

      expect(
        screen.getByRole('button', { name: REMOVE_BUTTON_NAME })
      ).toBeInTheDocument();
    });

    it('does not render a Remove button when onRemove is not provided', () => {
      render(<Badge>{BADGE_TEXT}</Badge>);

      expect(
        screen.queryByRole('button', { name: REMOVE_BUTTON_NAME })
      ).not.toBeInTheDocument();
    });

    it('calls onRemove when the Remove button is clicked', async () => {
      const handleRemoveBadge = jest.fn();
      render(<Badge onRemove={handleRemoveBadge}>{BADGE_TEXT}</Badge>);

      await userEvent.click(
        screen.getByRole('button', { name: REMOVE_BUTTON_NAME })
      );

      expect(handleRemoveBadge).toHaveBeenCalledTimes(1);
    });
  });

  describe('className prop', () => {
    it('forwards the className prop to the root span', () => {
      render(<Badge className={CUSTOM_CLASS_NAME}>{BADGE_TEXT}</Badge>);

      expect(screen.getByText(BADGE_TEXT)).toHaveClass(CUSTOM_CLASS_NAME);
    });
  });
});
