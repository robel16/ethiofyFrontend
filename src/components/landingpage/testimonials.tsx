"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Designer & Creator",
    content:
      "PrintFlow changed my business completely. The direct connection to print providers means better margins and faster fulfillment. I've scaled from 10 to 500+ orders per month!",
    rating: 5,
    avatar: "/professional-woman-smiling.png",
  },
  {
    name: "Marcus Rodriguez",
    role: "E-commerce Entrepreneur",
    content:
      "The transparency and control over the entire process is incredible. No middleman fees, direct communication with providers, and the quality is consistently excellent.",
    rating: 5,
    avatar: "/professional-man-smiling.png",
  },
  {
    name: "Emma Thompson",
    role: "Brand Owner",
    content:
      "We moved our entire merchandise line to PrintFlow. The cost savings and quality improvements have been remarkable. Our customers love the faster shipping times too.",
    rating: 5,
    avatar: "/professional-woman-glasses.png",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-2xl font-bold">4.9/5</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold">
            Trusted by thousands of creators
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            See what our community says about their PrintFlow experience
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:from-gray-800 dark:to-gray-900"
            >
              <CardContent className="p-8">
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="mr-4 h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
