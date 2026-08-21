# UI Components Guide

This guide demonstrates how to use the atomic UI components.

## Button Component

### Basic Usage

```tsx
import { Button } from './components/ui';
import { Send, Download } from 'lucide-react';

// Primary button (default)
<Button onClick={() => console.log('Clicked')}>
  Click Me
</Button>

// With icon
<Button icon={<Send size={20} />}>
  Send Message
</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

### Accessibility Features
- Minimum 44px touch target on mobile
- Focus ring with 2px outline
- ARIA busy state when loading
- Disabled state with proper opacity

## Input Component

### Basic Usage

```tsx
import { Input } from './components/ui';
import { Mail, Lock } from 'lucide-react';

// Basic input
<Input
  name="email"
  type="email"
  placeholder="Enter your email"
  label="Email Address"
  required
/>

// With icon
<Input
  name="email"
  type="email"
  icon={<Mail size={20} />}
  placeholder="email@example.com"
  label="Email"
/>

// With helper text
<Input
  name="password"
  type="password"
  label="Password"
  helperText="Must be at least 8 characters"
/>

// With error
<Input
  name="email"
  type="email"
  label="Email"
  error="Please enter a valid email address"
/>

// Controlled input
const [value, setValue] = useState('');

<Input
  name="username"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  label="Username"
/>
```

### Features
- Inline validation on blur
- Success state indicator
- Error state with shake animation
- Icon support (leading)
- Helper text and error messages
- Full accessibility support

## Textarea Component

### Basic Usage

```tsx
import { Textarea } from './components/ui';

// Basic textarea
<Textarea
  name="message"
  label="Message"
  placeholder="Enter your message"
  rows={4}
/>

// With validation
<Textarea
  name="description"
  label="Description"
  helperText="Describe your experience"
  error="Description is required"
  required
/>
```

## Select Component

### Basic Usage

```tsx
import { Select } from './components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

<Select
  name="category"
  label="Category"
  options={options}
  helperText="Choose a category"
/>

// With error
<Select
  name="country"
  label="Country"
  options={countryOptions}
  error="Please select a country"
  required
/>
```

## Icon Component

### Basic Usage

```tsx
import { Icon } from './components/ui';
import { Home, User, Settings, Bell } from 'lucide-react';

// Basic icon (24px default)
<Icon name={<Home />} ariaLabel="Home" />

// Different sizes
<Icon name={<User />} size="sm" ariaLabel="User" />
<Icon name={<Settings />} size="md" ariaLabel="Settings" />
<Icon name={<Bell />} size="lg" ariaLabel="Notifications" />

// With color
<Icon name={<Home />} color="mountain-600" ariaLabel="Home" />

// Semantic colors
<Icon name={<CheckCircle />} color="success" ariaLabel="Success" />
<Icon name={<AlertCircle />} color="error" ariaLabel="Error" />
```

### Accessibility
- Minimum 24px size (design system requirement)
- ARIA labels for screen readers
- Proper role attributes

## Typography Components

### Basic Usage

```tsx
import { H1, H2, H3, H4, Body, BodyLarge, BodySmall, Caption, Display } from './components/ui';

// Headings
<H1>Main Heading</H1>
<H2>Section Heading</H2>
<H3>Subsection Heading</H3>
<H4>Minor Heading</H4>

// Body text (minimum 16px)
<Body>This is body text with minimum 16px size for readability.</Body>
<BodyLarge>Larger body text for emphasis.</BodyLarge>
<BodySmall>Smaller body text for secondary information.</BodySmall>

// Caption
<Caption>Small caption text</Caption>

// Display (largest)
<Display>Hero Display Text</Display>

// With custom props
<H1 weight="bold" color="mountain-600">
  Colored Heading
</H1>

<Body as="span" className="italic">
  Custom styled text
</Body>
```

### Features
- Semantic HTML elements by default
- Proper line heights for readability
- Minimum 16px body text size
- Responsive font scaling
- Custom weight and color options

## Form Example

```tsx
import { Button, Input, Textarea, Select } from './components/ui';
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <Input
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
      />

      <Select
        name="category"
        label="Category"
        options={[
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Support' },
          { value: 'feedback', label: 'Feedback' },
        ]}
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        error={errors.category}
        required
      />

      <Textarea
        name="message"
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        rows={6}
        error={errors.message}
        required
      />

      <Button type="submit" fullWidth>
        Submit
      </Button>
    </form>
  );
}
```

## Accessibility Checklist

All components meet WCAG 2.1 AA standards:

- ✅ Minimum 44px touch targets on mobile
- ✅ 4.5:1 color contrast for text
- ✅ 3:1 color contrast for interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ ARIA labels and roles
- ✅ Screen reader compatible
- ✅ Error messages announced
- ✅ Semantic HTML structure
- ✅ Minimum 16px body text

## Responsive Behavior

All components are responsive by default:

- Buttons: 44px minimum height on mobile, can be smaller on desktop
- Inputs: Full width by default, stack vertically on mobile
- Typography: Scales appropriately across breakpoints
- Icons: Maintain aspect ratio and minimum size

## Next Steps

1. Create molecular components (Card, FormGroup, NavigationItem)
2. Build organism components (Navbar, Footer, FeatureTabs)
3. Implement page templates
4. Add animations and transitions
