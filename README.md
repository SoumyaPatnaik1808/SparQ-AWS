# SparQ

SparQ is a peer-to-peer knowledge exchange for college students. It lets students trade time and expertise instead of money: one person can offer Blender, design, or coding help in exchange for another skill such as React Native, Rust, or systems programming.

The application currently includes a polished landing page, student registration and login, a swipe-style barter feed, guest browsing, and AWS-backed authentication and feed data. The feed also includes sample posts, so the interface remains usable when DynamoDB is empty or unavailable.

## Features

- Browse the landing page and explore the feed as a guest.
- Register with a first name, last name, email, password, teaching skills, and learning goals.
- Authenticate users with Amazon Cognito.
- Store authenticated sessions in secure, HTTP-only cookies.
- Load barter opportunities from DynamoDB with a built-in mock-data fallback.
- Pass or match with opportunities using buttons, horizontal drag gestures, or keyboard shortcuts.
- Show a guest sign-up prompt when an unauthenticated visitor tries to match.
- Show a successful-match flow for authenticated users, including the option to join the creator's community.
- Listen for new Cal.com session bookings through an AWS AppSync GraphQL subscription at `/calendar`.
- Responsive dark interface with Framer Motion transitions and Lucide icons.

## Technology

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 through PostCSS
- Framer Motion for interaction and page transitions
- Lucide React for interface icons
- AWS SDK v3 for Cognito and DynamoDB integration
- AWS Amplify API for AppSync GraphQL subscriptions
- ESLint with the Next.js configuration

## Requirements

- Node.js 20 or newer is recommended.
- npm, or another package manager compatible with the included lockfile and package manifest.
- AWS credentials available to the server-side AWS SDK when using Cognito or DynamoDB.
- An Amazon Cognito User Pool and App Client for registration and login.
- A DynamoDB table containing feed items if you want to load live opportunities instead of the fallback posts.
- An AppSync GraphQL API exposing `onSessionAdded(studentEmail: String!)`.

## Getting Started

Install dependencies:

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. Run `npm run build` first. |
| `npm run lint` | Run ESLint across the project. |

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | SparQ landing page and product overview. |
| `/register` | Create a SparQ account and select skills to teach and learn. |
| `/login` | Sign in with Cognito credentials. |
| `/feed` | Browse, pass, and match with barter opportunities. |
| `/feed?guest=true` | Browse the feed without signing in. Matching opens the sign-up prompt. |

## Project Structure

```text
app/
	actions/
		auth.ts          # Cognito registration
		feed.ts          # DynamoDB feed loading and fallback data
		login.ts         # Cognito login and session cookies
		verifyOtp.ts     # Cognito MFA challenge verification
	feed/page.tsx      # Swipeable barter feed
	calendar/page.tsx  # Real-time session booking view
	components/        # Client components, including the session subscription
	lib/amplify.ts      # Browser-side AppSync/Amplify configuration
	login/page.tsx     # Login form
	register/page.tsx  # Registration form and skill selection
	globals.css        # Global Tailwind and page styles
	layout.tsx         # Root layout and metadata
	page.tsx           # Landing page
public/              # Static assets
```

## AWS Configuration

### Amazon Cognito

Registration sends the following user attributes to Cognito:

- `given_name`
- `family_name`
- `email`
- `custom:teach_skills`
- `custom:learn_skills`

The app calculates a Cognito `SECRET_HASH` using the configured client secret. Login uses the `USER_PASSWORD_AUTH` flow. When authentication succeeds, the server stores `sparq_auth` and, when returned by Cognito, `sparq_id_token` as HTTP-only cookies for seven days.

The current login UI reports an error if Cognito returns an MFA challenge. The app does not provide a sign-up email confirmation flow; configure the Cognito user pool to auto-confirm users and disable required email verification if registration should not require an OTP.

### DynamoDB

The feed action scans the table named by `DYNAMODB_TABLE_NAME`. Each feed item is expected to provide fields similar to:

```json
{
	"id": "1",
	"authorName": "Elena Vance",
	"authorTitle": "Stanford CS & Design",
	"authorImage": "",
	"rating": 4.9,
	"swaps": 32,
	"postTitle": "Mastering Blender 3D & Realtime Shaders",
	"postDescription": "Direct 1-on-1 mentorship focused on real production techniques.",
	"tags": ["Interactive 3D Pipeline"],
	"learnItems": ["Procedural geometry nodes"],
	"lookingFor": "React Native Mobile Architecture",
	"barterType": "1:1 Barter"
}
```

If the scan fails or returns no items, `app/actions/feed.ts` returns the built-in sample opportunities instead.

### AppSync and Cal.com session updates

The calendar page uses `generateClient` from `@aws-amplify/api` to subscribe to the `onSessionAdded` AppSync field. Incoming events are filtered by the student email supplied on the page and inserted into local React state immediately. Duplicate event IDs replace the older copy, and the subscription is unsubscribed automatically when the component unmounts.

The repository currently receives the AppSync real-time URL in `NEXT_PUBLIC_APPSYNC_GRAPHQL_URL`. The client derives the HTTPS GraphQL endpoint from a URL such as `wss://API_ID.appsync-realtime-api.REGION.amazonaws.com/graphql`. Add the matching AppSync API key as `NEXT_PUBLIC_APPSYNC_API_KEY` when the API uses API key authentication. The subscription currently uses `authMode: "apiKey"`; change the Amplify configuration and auth mode together if the AppSync API uses Cognito User Pools or IAM instead.

The expected subscription shape is:

```graphql
subscription OnSessionAdded($studentEmail: String!) {
	onSessionAdded(studentEmail: $studentEmail) {
		id
		title
		startTime
		status
	}
}
```

Open `/calendar`, enter the email that Cal.com sends with the booking event, and keep the page open to see new sessions arrive without refreshing.

## How the Feed Works

1. The feed loads posts through the `getFeedPosts` server action.
2. A user can drag a card right to match or left to pass.
3. The `Match` and `Pass` buttons perform the same actions.
4. On desktop, `D` matches and `A` passes.
5. Guests can browse, but matching redirects them to an account prompt.
6. Authenticated matches display a success dialog and allow the user to join the creator's community or continue browsing.

## Security Notes

Keep `.env.local` out of version control and never commit AWS credentials. The current code reads the Cognito client secret from `NEXT_PUBLIC_CLIENT_SECRET`; the `NEXT_PUBLIC_` prefix conventionally exposes values to browser bundles, so this variable should be renamed to a server-only environment variable before production deployment. The Cognito secret is used by server actions and should never be sent to the client.

The current feed route is a client-rendered experience and does not yet enforce authentication at the route level. Guest access is intentionally supported by the UI, while match behavior is gated in the client flow.

## Development Notes

- The home, login, registration, and feed experiences use a dark green-and-orange visual system defined primarily through Tailwind utility classes.
- The root layout still contains the default Next.js metadata values and can be updated with production title and description values.
- Several feed navigation items such as Community, Calendar, and Profile are currently presentation-only links.
- The `/calendar` page is the first live calendar surface; it currently asks for the student email because the existing HTTP-only auth cookies are not readable by browser code.
- No automated test suite is configured yet; use `npm run lint` and `npm run build` as the current validation checks.

## Deployment

Build the application in the target environment and provide the same environment variables used locally:

```bash
npm run build
npm run start
```

For deployment, ensure the runtime IAM identity can access the configured Cognito and DynamoDB resources, configure the Cognito app client for the deployed domain, and store secrets in the hosting provider's server-side environment configuration rather than in source control.
