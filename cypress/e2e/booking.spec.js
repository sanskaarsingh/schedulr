describe('Booking Flow', () => {
    const testUser = {
        name: 'Test Owner',
        email: `test-owner-${Date.now()}@example.com`,
        password: 'password123'
    };
    let shareToken = '';

    it('should allow a new user to sign up and get a share link', () => {
        cy.visit('/auth');
        cy.contains('button', 'Sign Up').click();

        cy.get('input[type="text"]').type(testUser.name);
        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.contains('button', 'Sign Up').click();
        
        cy.url().should('include', '/dashboard');
        cy.contains('h1', 'Dashboard').should('be.visible');

        // Get the share token from the input field
        cy.get('input[type="text"][readonly]').invoke('val').then((val) => {
            const url = val;
            shareToken = url.split('/').pop();
            cy.log('Share Token:', shareToken);
            expect(shareToken).to.have.length(12);
        });
    });

    it('should allow a public user to request a booking and the owner to confirm it', () => {
        // Ensure we have a share token from the previous test
        if (!shareToken) {
            throw new Error("Share token was not captured from the sign-up test.");
        }

        // --- Public Booking Flow ---
        cy.visit(`/c/${shareToken}`);
        cy.contains('h1', 'Book a Meeting').should('be.visible');

        // Find the first available slot and click it
        cy.contains('button', /[0-9]:[0-9]{2}\s(A|P)M/i).first().click();

        // Fill out and submit the booking modal
        cy.get('input#name').type('Public Booker');
        cy.get('input#email').type('public@example.com');
        cy.contains('button', 'Request Slot').click();

        cy.contains('Booking request sent successfully!').should('be.visible');

        // --- Owner Confirmation Flow ---
        // Log in as the owner
        cy.visit('/auth');
        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.contains('button', 'Login').click();

        cy.url().should('include', '/dashboard');

        // Find the pending request and confirm it
        cy.contains('h2', 'Pending Booking Requests').should('be.visible');
        cy.contains('Public Booker (public@example.com)').should('be.visible');
        cy.contains('li', 'Public Booker').within(() => {
            cy.contains('button', 'Confirm').click();
        });

        // Verify success and that the request disappears from the pending list
        cy.contains('Booking confirmed and event created!').should('be.visible');
        cy.contains('Public Booker (public@example.com)').should('not.exist');

        // Verify the event now appears on the calendar
        cy.get('.md\\:col-span-2').within(() => {
            cy.contains('Booking with Public Booker').should('be.visible');
        });
    });
});