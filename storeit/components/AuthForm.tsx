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

const authSchema = (type: 'sign-in' | 'sign-up') => z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  ...(type === 'sign-up' && {
    email: z.string().email("Invalid email address."),
  })
})

type FormType = "sign-in" | "sign-up"

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const currentSchema = authSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      fullName: "",
      email: "", // Default value, but only validated for sign-up
    },
  })
 
  // 2. Define a submit handler.
  const onSubmit = async(values: z.infer<typeof currentSchema>) => {
    setIsLoading(true)
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(values)
    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md p-4">
      <h1 className="text-center text-5xl font-semibold mb-8 p-5">
        {type === "sign-in" ? "Sign In" : "Sign Up"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Full Name Field (visible for both sign-in and sign-up) */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg">
                  <FormLabel className="text-xs text-gray-500">Full name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field (visible only for sign-up) */}
          {type === 'sign-up' && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className={`rounded-xl border ${form.formState.errors.email ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg`}>
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
          )}
          
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

