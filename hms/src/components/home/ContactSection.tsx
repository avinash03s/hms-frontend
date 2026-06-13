import { useState } from "react";
import { Button, TextInput, Textarea } from "@mantine/core";
import { IconPhone, IconMail, IconMapPin, IconCircleCheck } from "@tabler/icons-react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("https://formsubmit.co/ajax/surwaseavinash85@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, _captcha: "false" }),
      });
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <section id="contact" className="bg-[#f4f7fb] py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          <div>
            <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4">
              Get In Touch
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              We're Here to <span className="text-[#1a6fa8]">Help You</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
              Have a question about our services, need to book an appointment, or want to know more about our health packages? Reach out to us anytime.
            </p>

            <div className="space-y-4">
              {[
                { icon: <IconPhone size={18} stroke={1.5} />, label: "Phone", value: "+91 88888 22222" },
                { icon: <IconMail size={18} stroke={1.5} />, label: "Email", value: "care@pulsecare.in" },
                { icon: <IconMapPin size={18} stroke={1.5} />, label: "Address", value: "Near Phoenix Hospital, Beed - 431122" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#1a6fa8] shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                    <p className="text-gray-800 text-sm font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-5 min-h-[280px] text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <IconCircleCheck size={36} className="text-[#1a6fa8]" stroke={1.5} />
                </div>
                <div>
                  <h3 className="text-gray-900 text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-[#1a6fa8] hover:underline font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Send us a Message</h3>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1.5 block">Full Name</label>
                  <TextInput
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="Enter your full name" required radius="md" size="md"
                    styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb" } }}
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1.5 block">Email</label>
                  <TextInput
                    name="email" value={form.email} onChange={handleChange}
                    type="email" placeholder="Enter your email" required radius="md" size="md"
                    styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb" } }}
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea
                    name="message" value={form.message} onChange={handleChange}
                    placeholder="Write your message..." required radius="md" minRows={4}
                    styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb" } }}
                  />
                </div>
                <Button type="submit" fullWidth radius="md" size="md" color="#1a6fa8" loading={loading}>
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;