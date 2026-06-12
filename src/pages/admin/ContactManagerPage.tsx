import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';
import { Mail, Phone, MapPin, Save, MessageSquare, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const get = (key: string, fallback = '') => cmsContent[key] ?? fallback;

  const [info, setInfo] = useState({
    contact_email: get('contact_email', 'imagify.pro@gmail.com'),
    contact_phone: get('contact_phone', '+880 1700-000000'),
    contact_address: get('contact_address', 'Dhaka, Bangladesh'),
    contact_hours: get('contact_hours', 'Mon–Fri, 9 AM – 6 PM (BST)'),
    contact_response_time: get('contact_response_time', 'Within 24 hours on business days'),
    contact_page_title: get('contact_page_title', 'Get In Touch'),
    contact_page_subtitle: get('contact_page_subtitle', 'Have a question or feedback? We would love to hear from you.'),
    contact_form_name_label: get('contact_form_name_label', 'Your Name'),
    contact_form_email_label: get('contact_form_email_label', 'Email Address'),
    contact_form_subject_label: get('contact_form_subject_label', 'Subject'),
    contact_form_message_label: get('contact_form_message_label', 'Message'),
    contact_form_submit_label: get('contact_form_submit_label', 'Send Message'),
    contact_form_success_msg: get('contact_form_success_msg', 'Thank you! We\'ll get back to you within 24 hours.'),
    contact_map_embed_url: get('contact_map_embed_url', ''),
  });

  const [formEnabled, setFormEnabled] = useState(get('contact_form_enabled', 'true') === 'true');
  const [mapEnabled, setMapEnabled] = useState(get('contact_map_enabled', 'false') === 'true');

  const save = () => {
    bulkUpdateCMSContent({
      ...info,
      contact_form_enabled: formEnabled ? 'true' : 'false',
      contact_map_enabled: mapEnabled ? 'true' : 'false',
    });
    toast.success('Contact page saved');
  };

  return (
    <DashboardLayout requireAdmin>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contact Page Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edit contact info, form text and map settings</p>
          </div>
        </div>
        <Button icon={<Save size={14} />} onClick={save}>Save All Changes</Button>
      </div>

      <div className="space-y-6">

        {/* Page Text */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Page Header</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Page Title" value={info.contact_page_title} onChange={e => setInfo(i => ({ ...i, contact_page_title: e.target.value }))} />
            <div className="sm:col-span-2">
              <Input label="Page Subtitle" value={info.contact_page_subtitle} onChange={e => setInfo(i => ({ ...i, contact_page_subtitle: e.target.value }))} />
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Phone size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Contact Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Email Address" value={info.contact_email} onChange={e => setInfo(i => ({ ...i, contact_email: e.target.value }))} icon={<Mail size={14} />} />
            <Input label="Phone Number" value={info.contact_phone} onChange={e => setInfo(i => ({ ...i, contact_phone: e.target.value }))} icon={<Phone size={14} />} />
            <Input label="Address / Location" value={info.contact_address} onChange={e => setInfo(i => ({ ...i, contact_address: e.target.value }))} icon={<MapPin size={14} />} />
            <Input label="Business Hours" value={info.contact_hours} onChange={e => setInfo(i => ({ ...i, contact_hours: e.target.value }))} />
            <Input label="Response Time" value={info.contact_response_time} onChange={e => setInfo(i => ({ ...i, contact_response_time: e.target.value }))} />
          </div>
        </Card>

        {/* Contact Form */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Contact Form</h2>
            </div>
            <Toggle checked={formEnabled} onChange={setFormEnabled} label="Show contact form" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name Field Label" value={info.contact_form_name_label} onChange={e => setInfo(i => ({ ...i, contact_form_name_label: e.target.value }))} />
            <Input label="Email Field Label" value={info.contact_form_email_label} onChange={e => setInfo(i => ({ ...i, contact_form_email_label: e.target.value }))} />
            <Input label="Subject Field Label" value={info.contact_form_subject_label} onChange={e => setInfo(i => ({ ...i, contact_form_subject_label: e.target.value }))} />
            <Input label="Message Field Label" value={info.contact_form_message_label} onChange={e => setInfo(i => ({ ...i, contact_form_message_label: e.target.value }))} />
            <Input label="Submit Button Text" value={info.contact_form_submit_label} onChange={e => setInfo(i => ({ ...i, contact_form_submit_label: e.target.value }))} />
            <Input label="Success Message" value={info.contact_form_success_msg} onChange={e => setInfo(i => ({ ...i, contact_form_success_msg: e.target.value }))} />
          </div>
        </Card>

        {/* Map */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Map Embed</h2>
            </div>
            <Toggle checked={mapEnabled} onChange={setMapEnabled} label="Show map on page" />
          </div>
          <Input
            label="Google Maps Embed URL"
            value={info.contact_map_embed_url}
            onChange={e => setInfo(i => ({ ...i, contact_map_embed_url: e.target.value }))}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-xs text-gray-400 mt-2">Go to Google Maps → Share → Embed a map → copy the src URL</p>
        </Card>

      </div>
    </DashboardLayout>
  );
};
