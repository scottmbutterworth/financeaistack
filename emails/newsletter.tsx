import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

export type NewsletterPick = {
  name: string;
  line: string;
  href: string;
};

export type NewsletterProps = {
  preview: string;
  picks: NewsletterPick[];
  storyTitle: string;
  storyBody: string;
  storyHref: string;
  sponsorName: string;
  sponsorHref: string;
  siteUrl: string;
};

export function NewsletterEmail({
  preview,
  picks,
  storyTitle,
  storyBody,
  storyHref,
  sponsorName,
  sponsorHref,
  siteUrl,
}: NewsletterProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={kicker}>Finance AI Stack</Text>
          <Heading style={heading}>Five things worth a finance team&apos;s time</Heading>
          <Text style={intro}>
            Short picks from the directory. Each line links back to the write-up, including the price source.
          </Text>
          {picks.slice(0, 5).map((pick) => (
            <Text key={pick.href} style={pickLine}>
              <Link href={pick.href} style={link}>
                {pick.name}
              </Link>
              {" — "}
              {pick.line}
            </Text>
          ))}
          <Hr style={rule} />
          <Text style={kicker}>How a finance team did it</Text>
          <Heading as="h2" style={storyHeading}>
            {storyTitle}
          </Heading>
          <Text style={story}>{storyBody}</Text>
          <Text style={pickLine}>
            <Link href={storyHref} style={link}>
              Read the steps
            </Link>
          </Text>
          <Hr style={rule} />
          <Text style={sponsor}>
            Sponsored by{" "}
            <Link href={sponsorHref} style={link}>
              {sponsorName}
            </Link>
          </Text>
          <Text style={footer}>
            You are on the Finance AI Stack list.{" "}
            <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={link}>
              Unsubscribe
            </Link>
            .{" "}
            <Link href={siteUrl} style={link}>
              financeaistack.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f4f0e6",
  fontFamily: "Georgia, 'Iowan Old Style', serif",
  margin: "0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#fbf8f2",
  border: "1px solid #ddd4c4",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "28px 28px 20px",
};

const kicker = {
  color: "#1e4d3a",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "12px",
  letterSpacing: "0.08em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#1a1814",
  fontSize: "26px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "0 0 12px",
};

const intro = {
  color: "#5c564c",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const pickLine = {
  color: "#1a1814",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "15px",
  lineHeight: "1.45",
  margin: "0 0 10px",
};

const link = { color: "#1e4d3a" };

const rule = { borderColor: "#ddd4c4", margin: "18px 0" };

const storyHeading = {
  color: "#1a1814",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const story = {
  color: "#1a1814",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const sponsor = {
  color: "#1a1814",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "14px",
  margin: "0 0 12px",
};

const footer = {
  color: "#5c564c",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};

export default NewsletterEmail;
