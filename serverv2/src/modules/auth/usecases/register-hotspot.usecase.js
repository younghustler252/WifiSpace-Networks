

export class RegisterHotspotUser {
    constructor(userRepository, passwordService, auditService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.auditService = auditService;
    }

    async execute({ firstName, email, phone }) {
        // 1. Check if user exists by Email (Paystack's primary ID)
        let user = await this.userRepository.findByEmail(email);
        
        if (!user) {
            // 2. New User: SILENT REGISTER
            // We use the phone number as the password for easy MikroTik login
            const hashedPassword = await this.passwordService.hash(phone); 
            
            user = await this.userRepository.create({
                firstName,
                lastName: "Guest", 
                email: email, 
                password: hashedPassword, // The hashed pass for your DB
                role: "customer",
                status: "active",
                isVerified: true, // Auto-verify via Payment
                phone
            });

            // 3. Audit Log
            await this.auditService.log({
                actorId: user.id,
                action: "HOTSPOT_AUTO_REGISTER",
                metadata: { email, phone, method: "Paystack_Silent" }
            });
        } else {
            // 4. Returning User
            // Ensure the phone number is updated if it was missing before
            if (!user.phone && phone) {
                await this.userRepository.update(user.id, { phone });
            }
        }

        return user;
    }
}