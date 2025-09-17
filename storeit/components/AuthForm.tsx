"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { set, z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import React, { useState } from "react"
import { Client, Account, ID } from "appwrite"
import { appwriteConfig } from "@/lib/appwrite/config"
import { ensureUserDocument } from "@/lib/actions/user.actions"


// Email OTP: only email (and optional fullName for sign-up UI)
const authSchema = (type: 'sign-in' | 'sign-up') => z.object({
    email: z.string().email("Invalid email address."),
    ...(type === 'sign-up' && {
        fullName: z.string().min(3, "Full name must be at least 3 characters."),
    })
})

type FormType = "sign-in" | "sign-up"

const AuthForm = ({ type }: { type: FormType }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const currentSchema = authSchema(type);
    const [phase, setPhase] = useState<"request" | "verify">("request")
    const [otpCode, setOtpCode] = useState("")
    const [otpUserId, setOtpUserId] = useState<string | null>(null)

    const form = useForm<z.infer<typeof currentSchema>>({
        resolver: zodResolver(currentSchema),
        defaultValues: {
            fullName: "",
            email: "",
        },
    })

    // Email OTP flow: request -> verify
   const onSubmit = async (values: z.infer<typeof currentSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
        const client = new Client()
            .setEndpoint(appwriteConfig.endpointUrl)
            .setProject(appwriteConfig.projectId)
        const account = new Account(client)

        if (phase === "request") {
            const token = await account.createEmailToken(ID.unique(), values.email)
            setOtpUserId(token.userId)
            setPhase("verify")
        } else {
            if (!otpCode) throw new Error("Enter the code sent to your email.")
            if (!otpUserId) throw new Error("Missing user. Please request a new code.")

            // If a session already exists, skip creating a new one
            const currentUser = await account.get().catch(() => null)
            if (!currentUser) {
                try {
                    await account.createSession(otpUserId, otpCode)
                } catch (e: any) {
                    const message = typeof e?.message === 'string' ? e.message : ''
                    if (!message.includes('session is active')) {
                        throw e
                    }
                }
            }

            // Ensure a corresponding user document exists in Appwrite Database
            await ensureUserDocument({ userId: otpUserId, email: values.email, fullName: (values as any).fullName })
            // Optionally navigate or refresh here
        }

    } catch (error) {
        console.error(error);
        
        setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="w-full max-w-md p-4">
            <h1 className="text-center text-5xl font-semibold mb-8 p-5">
                {type === "sign-in" ? "Sign In" : "Sign Up"}
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Full Name Field (visible only for sign-up) */}
                    {type === 'sign-up' && (
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                                        <FormLabel className="text-xs text-gray-500">Full name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name"
                                                {...field}
                                                value={typeof field.value === 'string' ? field.value : ''}
                                                className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                                            >
                                            </Input>
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Email Field (always visible) */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <div className={`rounded-xl border ${form.formState.errors.email ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2`}>
                                    <FormLabel className="text-xs text-gray-500">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            {...field}
                                            value={typeof field.value === 'string' ? field.value : ''}
                                            className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                                            disabled={phase === "verify"}
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {phase === "verify" && (
                        <div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                                <FormLabel className="text-xs text-gray-500">Verification code</FormLabel>
                                <Input
                                    placeholder="Enter the code from your email"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">We sent a code to your email.</p>
                        </div>
                    )}

                    <Button
                        className="w-full h-14 bg-[#F85A5A] rounded-full text-lg font-semibold text-white hover:bg-[#E04F4F] transition-colors"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            phase === "verify" ? "Verify Code" : (type === "sign-in" ? "Send Sign In Code" : "Send Sign Up Code")
                        )}
                    </Button>
                </form>
            </Form>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            <p className="text-center text-gray-600 mt-6">
                {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}
                <a href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="text-[#F85A5A] font-semibold ml-2 hover:underline">
                    {type === "sign-in" ? "Sign Up" : "Sign In"}
                </a>
            </p>
        </div>
    )
}

export default AuthForm
