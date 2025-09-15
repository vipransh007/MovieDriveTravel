"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { createAccount, signIn } from "@/lib/actions/user.actions"


// FIXED: Updated schema to be more realistic for both types
const authSchema = (type: 'sign-in' | 'sign-up') => z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    // Only require fullName for sign-up
    ...(type === 'sign-up' && {
        fullName: z.string().min(3, "Full name must be at least 3 characters."),
    })
})

type FormType = "sign-in" | "sign-up"

const AuthForm = ({ type }: { type: FormType }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const currentSchema = authSchema(type);

    const form = useForm<z.infer<typeof currentSchema>>({
        resolver: zodResolver(currentSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    })

    // FIXED: Rewritten submit handler for robustness
    const onSubmit = async (values: z.infer<typeof currentSchema>) => {
        setIsLoading(true);
        setError(null);

        try {
            if (type === 'sign-up') {
                // Sign up a new user
                const newUser = await createAccount({
                    fullName: values.fullName!, // The '!' asserts it exists, as it's required for sign-up
                    email: values.email,
                    password: values.password // Pass password if your action needs it
                });
                // Handle successful sign-up (e.g., redirect)
            }

            if (type === 'sign-in') {
                // Sign in an existing user
                const response = await signIn({ email: values.email, password: values.password });
                // Handle successful sign-in
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred");
            // Handle errors (e.g., show a toast notification)
        } finally {
            // CRITICAL: Ensure loading state is always reset
            setIsLoading(false);
        }
    }

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
                                            <Input    placeholder="Enter your full name"
                                                {...field}
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
                                            className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password Field (always visible) */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className={`rounded-xl border ${form.formState.errors.password ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2`}>
                                    <FormLabel className="text-xs text-gray-500">Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                            className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <Button
                        className="w-full h-14 bg-[#F85A5A] rounded-full text-lg font-semibold text-white hover:bg-[#E04F4F] transition-colors"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            type === "sign-in" ? "Sign In" : "Create Account"
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
