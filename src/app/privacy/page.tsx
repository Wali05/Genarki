import { MainLayout } from "@/components/layout/main-layout";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              At Genarki, we respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you how we look after your personal data when you visit 
              our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">The Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which 
              we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Identity Data includes first name, last name, username or similar identifier.</li>
              <li>Contact Data includes email address.</li>
              <li>Technical Data includes internet protocol (IP) address, browser type and version, time zone setting and location, operating system and platform, and other technology on the devices you use to access this website.</li>
              <li>Usage Data includes information about how you use our website and services.</li>
            </ul>
            <p>
              We do not collect any Special Categories of Personal Data about you (this includes details 
              about your race or ethnicity, religious or philosophical beliefs, sex life, sexual 
              orientation, political opinions, trade union membership, information about your health, 
              and genetic and biometric data).
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use 
              your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p>
              We will only retain your personal data for as long as reasonably necessary to fulfill the 
              purposes we collected it for, including for the purposes of satisfying any legal, regulatory, 
              tax, accounting or reporting requirements.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to 
              your personal data including the right to receive a copy of the personal data we hold 
              about you and the right to make a complaint at any time.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes by 
              posting the new privacy policy on this page and updating the "Last updated" date at the 
              top of this privacy policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please 
              contact us at:
            </p>
            <p className="mt-2">
              <a href="mailto:info@genarki.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                info@genarki.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
} 