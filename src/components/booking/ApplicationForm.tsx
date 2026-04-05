import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(6, { message: "Please enter a valid phone number." }),
  concern: z.string().optional(),
});

interface ApplicationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    price: string;
    stripePriceId?: string;
  };
}

export default function ApplicationForm({ isOpen, onOpenChange, service }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      concern: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // 1. Initialize Stripe
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
      if (!stripe) throw new Error("Stripe failed to load");

      // 2. Call our Vercel Serverless Function
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: service.stripePriceId,
          name: values.name,
          email: values.email,
          serviceName: service.name,
          successUrl: `${window.location.origin}/booking-success?email=${encodeURIComponent(values.email)}&name=${encodeURIComponent(values.name)}`,
          cancelUrl: window.location.href,
        }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);

      // 3. Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error("There was an issue initiating your payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl bg-card/95 backdrop-blur-md border border-primary/20 shadow-2xl shadow-primary/10">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">Apply for Treatment</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You're booking: <span className="font-semibold text-foreground">{service.name}</span> ({service.price}). 
            Complete this form to proceed to payment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="concern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Concern (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Lower back pain, posture..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Securing Session...
                </>
              ) : (
                <>Pay & Continue to Booking</>
              )}
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground italic px-4">
              Secure payment processed via Stripe. You'll pick your actual appointment time on the next page.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
