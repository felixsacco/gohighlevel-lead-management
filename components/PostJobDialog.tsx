'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostJobDialogProps {
  onJobPosted: () => void;
}

const TRADES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Roofing',
  'HVAC',
  'Landscaping',
  'Cleaning',
  'Moving',
  'Other'
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'negotiable', label: 'Negotiable' }
];

// AI-powered job description suggestions based on trade
const getAISuggestions = (trade: string) => {
  const suggestions = {
    'Plumbing': [
      "I need a qualified plumber to fix a leaking kitchen tap. The tap has been dripping constantly for 2 days. Located under the sink, easy access. Please bring necessary parts.",
      "Bathroom toilet is blocked and won't flush properly. Need urgent plumbing help. Have tried basic unblocking but issue persists. Ground floor bathroom.",
      "Installing a new washing machine in utility room. Need plumber to connect water supply and drainage. All pipes are accessible. Machine is already delivered.",
      "Shower pressure is very low in upstairs bathroom. All other taps work fine. Need diagnosis and repair. Prefer morning appointment if possible."
    ],
    'Electrical': [
      "Need qualified electrician to install 3 new power sockets in living room. Walls are plasterboard, easy access. All materials to be provided by tradesperson.",
      "Kitchen lights keep flickering and sometimes go off completely. Need urgent electrical inspection and repair. Safety concern with young children in house.",
      "Installing new electric oven in kitchen. Need electrician to connect to mains supply. Existing connection point available. Oven is already purchased.",
      "Outdoor security lights not working after recent storm. Need electrician to check wiring and replace if necessary. 2 lights on front of house."
    ],
    'Carpentry': [
      "Need custom-built shelving unit for living room alcove. Measurements: 2m wide x 2.5m high x 30cm deep. Pine wood preferred. Include 4 adjustable shelves.",
      "Kitchen cabinet door has come off hinges and won't close properly. Need carpenter to repair or replace hinges. Door is solid wood, standard size.",
      "Building a garden shed foundation and frame. Concrete base already laid. Need experienced carpenter for wooden frame construction. Materials list available.",
      "Wooden stairs creaking badly, especially 3rd and 7th steps. Need carpenter to inspect and repair. Stairs are painted softwood, straight flight."
    ],
    'Painting & Decorating': [
      "Need living room painted - 2 coats throughout. Room size: 4m x 5m, standard height ceiling. Currently magnolia, want to change to light grey. Include ceiling.",
      "Exterior front door needs stripping and repainting. Door is wooden, currently blue paint is peeling. Want professional finish in black. Include frame touch-up.",
      "Bedroom wallpaper removal and painting. One feature wall has textured wallpaper that needs careful removal. Room is 3m x 4m. Paint in neutral colors.",
      "Hallway and stairs decorating. Walls need filling and painting, woodwork needs gloss paint. High ceiling area, need experienced decorator with proper equipment."
    ],
    'Roofing': [
      "Several roof tiles are loose/missing after recent storm. Need roofer to inspect and replace tiles. Two-story house, pitched roof. Safety equipment essential.",
      "Guttering is overflowing during rain. Need cleaning and possible repair/replacement. Full house perimeter, includes downpipes. Access from garden available.",
      "Small leak in bedroom ceiling during heavy rain. Need roof inspection to find source and repair. Leak appears to be above window area.",
      "Flat roof garage needs waterproofing. Current felt is cracking and letting water in. Garage is 3m x 6m. Need durable solution."
    ],
    'Heating & Ventilation': [
      "Central heating boiler not working - no hot water or heating. Boiler is 8 years old, serviced annually. Need urgent repair, family with young children.",
      "Installing new bathroom extractor fan. Bathroom gets very steamy, need powerful fan with timer. Ducting to external wall required.",
      "Radiator in bedroom not heating up while others work fine. Need heating engineer to diagnose and repair. System was working fine until last week.",
      "Annual boiler service required. Gas boiler, last serviced 12 months ago. Need Gas Safe registered engineer. Prefer morning appointment."
    ],
    'Garden & Landscaping': [
      "Garden lawn needs complete renovation. Current grass is patchy and full of weeds. Garden is 10m x 8m, south-facing. Want professional lawn laying.",
      "Building raised flower beds along garden fence. Need 3 beds, each 2m long x 1m wide x 0.5m high. Include soil and basic planting advice.",
      "Tree pruning required - large oak tree overhanging neighbor's property. Need qualified tree surgeon with insurance. Tree is approximately 15m tall.",
      "Patio area needs pressure washing and re-pointing. Patio is 4m x 6m, natural stone. Some slabs are loose and need re-laying."
    ],
    'Cleaning': [
      "Deep clean of entire house after renovation work. 3-bedroom house, lots of dust and debris. Need professional cleaning team with industrial equipment.",
      "End of tenancy cleaning required. 2-bedroom flat, good condition but needs thorough clean for deposit return. Include oven, carpets, windows.",
      "Office cleaning contract - small office with 6 desks, kitchen area, 2 bathrooms. Need weekly cleaning service. Prefer early morning or evening.",
      "Carpet cleaning for living room and stairs. High-traffic areas with some stains. Carpets are light colored, need professional steam cleaning."
    ],
    'Kitchen & Bathroom': [
      "Complete bathroom renovation - remove old suite and install new. Bathroom is 2m x 2m, includes tiling, plumbing, electrical work. New suite already purchased.",
      "Kitchen worktop replacement - current laminate is damaged. Kitchen is L-shaped, approximately 4m total length. Prefer granite or quartz surface.",
      "Installing new bathroom shower - converting bath to walk-in shower. Need tiling, plumbing, and waterproofing. Bathroom is upstairs, good access.",
      "Kitchen cabinet doors need replacing - existing carcasses are good. 12 doors and 4 drawer fronts. Prefer modern white gloss finish."
    ],
    'General Handyman': [
      "Various small jobs around the house: fix squeaky door hinges, replace broken light switch, adjust wardrobe door, touch up paint in hallway.",
      "Flat-pack furniture assembly - large wardrobe and chest of drawers for bedroom. All parts and instructions included. Need someone with experience.",
      "Picture hanging and wall mounting - need 8 large pictures hung securely, plus TV wall mount in living room. Walls are plasterboard over brick.",
      "Garden gate repair - wooden gate is sagging and won't close properly. Hinges may need replacing. Gate is 1.8m high, standard width."
    ]
  };

  return suggestions[trade as keyof typeof suggestions] || [
    "Please describe your job in detail including: what needs to be done, location/room, any specific requirements, materials needed, and preferred timing.",
    "Be specific about the problem or work required. Include measurements, colors, materials, or any special considerations.",
    "Mention if you have materials already or if the tradesperson should provide them. Include access information and any time constraints.",
    "Describe the current situation and what you want to achieve. Include any relevant background information or previous attempts to fix the issue."
  ];
};


export default function PostJobDialog({ onJobPosted }: PostJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    trade: '',
    job_description: '',
    postcode: '',
    budget: '',
    budget_type: 'fixed',
    preferred_date: '',
    images: [] as File[]
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      job_description: suggestion
    }));
    setSelectedSuggestion(suggestion);
    setShowAISuggestions(false);
  };

  const handleDescriptionFocus = () => {
    if (formData.trade && !formData.job_description) {
      setShowAISuggestions(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered:', event.target.files);
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    setSelectedFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trade || !formData.job_description || !formData.postcode || !formData.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not logged in');
      }
      const user = JSON.parse(userData);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('trade', formData.trade);
      submitData.append('job_description', formData.job_description);
      submitData.append('postcode', formData.postcode);
      submitData.append('budget', formData.budget);
      submitData.append('budget_type', formData.budget_type);
      submitData.append('preferred_date', formData.preferred_date);
      submitData.append('client_id', user.id);

      // Append images
      formData.images.forEach((file, index) => {
        submitData.append(`images`, file);
      });

      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Job Posted Successfully!",
          description: "Your job is live — verified tradespeople in your area can now see it.",
        });
        
        // Reset form
        setFormData({
          trade: '',
          job_description: '',
          postcode: '',
          budget: '',
          budget_type: 'fixed',
          preferred_date: '',
          images: []
        });
        setSelectedFiles([]);
        setOpen(false);
        
        // Notify parent component
        onJobPosted();
      } else {
        throw new Error(data.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade Selection */}
          <div className="space-y-2">
            <Label htmlFor="trade">Trade *</Label>
            <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {TRADES.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="job_description" className="text-base font-semibold text-gray-800">
                Job Description *
              </Label>
              {formData.trade && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-brand-navy shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  <span className="mr-1">✨</span>
                  AI Assistant
                </Button>
              )}
            </div>
            
            <Textarea
              id="job_description"
              placeholder="✍️ Describe your project in detail... Need inspiration? Try our AI Assistant above!"
              value={formData.job_description}
              onChange={(e) => handleInputChange('job_description', e.target.value)}
              onFocus={handleDescriptionFocus}
              rows={5}
              required
              className="border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-base leading-relaxed"
            />
            

            {/* AI Suggestions Panel */}
            {showAISuggestions && formData.trade && (
              <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-xl animate-in slide-in-from-top-2 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✨</span>
                    </div>
                    <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-brand-navy bg-clip-text text-transparent">
                      AI Suggestions for {formData.trade}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAISuggestions(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full w-8 h-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
                
                <p className="text-sm text-purple-700 mb-4 bg-white/50 p-3 rounded-xl border border-purple-200">
                  💡 <strong>Choose from these professional examples</strong> - Click any suggestion to instantly use it, then customize as needed!
                </p>
                
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {getAISuggestions(formData.trade).map((suggestion, index) => (
                    <div
                      key={index}
                      className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-purple-100 cursor-pointer hover:border-purple-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 leading-relaxed mb-2">{suggestion}</p>
                          <div className="flex items-center text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="mr-1">👆</span>
                            Click to use this example
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500 text-lg">🎯</span>
                    <p className="text-sm text-green-800">
                      <strong>Pro tip:</strong> After selecting a suggestion, you can edit it to perfectly match your specific requirements!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postal Code *</Label>
              <Input
                id="postcode"
                placeholder="Enter your postal code"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Enter your postal code for job location
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Budget Type and Preferred Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_type">Budget Type</Label>
              <Select value={formData.budget_type} onValueChange={(value) => handleInputChange('budget_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_date">Preferred Date</Label>
              <Input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => handleInputChange('preferred_date', e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Job Images (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload images to help tradespeople understand the job
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  ref={(input) => {
                    // Store reference to input element
                    if (input) {
                      (window as any).fileInputRef = input;
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    console.log('Button clicked, triggering file input...');
                    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    } else {
                      console.error('File input not found!');
                    }
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>
            
            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Images ({selectedFiles.length}):</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-2">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {file.name}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 