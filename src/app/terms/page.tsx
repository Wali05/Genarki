import { MainLayout } from "@/components/layout/main-layout";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Genarki ("Company", "we", "our", "us")! As you have clicked "I agree" to these
              terms of service, you have entered into a binding contract with us. If you do not agree to these
              terms, please do not use our service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
            <p>
              Genarki provides an AI-powered SaaS validation and blueprint generation platform 
              ("Service") designed to help users validate business ideas and generate implementation 
              plans. Our Service is currently in beta phase and is subject to change.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p>
              In order to use our Service, you may be required to register for an account. You agree to 
              provide accurate, current, and complete information during the registration process and to 
              update such information to keep it accurate, current, and complete.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding your password. You agree not to disclose your password 
              to any third party and to take sole responsibility for any activities or actions under your 
              account, whether or not you have authorized such activities or actions.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain 
              information, text, graphics, or other material ("Content"). You are responsible for the 
              Content that you post on or through the Service, including its legality, reliability, and 
              appropriateness.
            </p>
            <p className="mt-2">
              By posting Content on or through the Service, You represent and warrant that: (i) the 
              Content is yours and/or you have the right to use it and the right to grant us the rights 
              and license as provided in these Terms, and (ii) that the posting of your Content on or 
              through the Service does not violate the privacy rights, publicity rights, copyrights, 
              contract rights or any other rights of any person or entity.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features and 
              functionality are and will remain the exclusive property of Genarki and its licensors. The 
              Service is protected by copyright, trademark, and other laws of both the United States and 
              foreign countries. Our trademarks and trade dress may not be used in connection with any 
              product or service without the prior written consent of Genarki.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Genarki, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from (i) your access to or use of or inability to access or 
              use the Service; (ii) any conduct or content of any third party on the Service; (iii) any 
              content obtained from the Service; and (iv) unauthorized access, use or alteration of your 
              transmissions or content, whether based on warranty, contract, tort (including negligence) 
              or any other legal theory, whether or not we have been informed of the possibility of such 
              damage.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material we will provide at least 30 days' notice prior to any new terms 
              taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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