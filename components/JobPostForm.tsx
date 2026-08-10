'use client';

import { useState } from 'react';
import { useReCaptcha } from '@/components/ReCaptchaProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase-client';

interface JobPostFormProps {
  onJobPosted?: () => void;
}

export default function JobPostForm({ onJobPosted }: JobPostFormProps) {
  const [formData, setFormData] = useState({
    trade: '',
    jobDescription: '',
    postcode: '',
    budget: '',
    budgetType: 'fixed',
    preferredDate: '',
    preferredTime: 'any',
    images: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { execute } = useReCaptcha();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');



  const tradeOptions = [
    // Plumbing & Water
    'Plumber',
    'Heating Engineer',
    'Gas Engineer',
    'Bathroom Fitter',
    'Shower Installer',
    'Boiler Engineer',
    'Water Heater Specialist',
    
    // Electrical
    'Electrician',
    'Electrical Engineer',
    'Security Installer',
    'TV Aerial Installer',
    'Smart Home Installer',
    'EV Charger Installer',
    
    // Building & Construction
    'Builder',
    'General Contractor',
    'Bricklayer',
    'Concrete Specialist',
    'Scaffolder',
    'Demolition Expert',
    'Extensions Specialist',
    
    // Painting & Decorating
    'Painter',
    'Decorator',
    'Wallpaper Specialist',
    'Exterior Painter',
    'Industrial Painter',
    
    // Roofing & Exterior
    'Roofer',
    'Gutter Specialist',
    'Chimney Sweep',
    'Fascia & Soffit Specialist',
    'Flat Roof Specialist',
    'Slate Roofer',
    'Tile Roofer',
    
    // Flooring & Tiling
    'Tiler',
    'Flooring Specialist',
    'Carpet Fitter',
    'Hardwood Flooring',
    'Laminate Flooring',
    'Vinyl Flooring',
    'Marble Specialist',
    'Granite Specialist',
    
    // Plastering & Drywall
    'Plasterer',
    'Drywall Specialist',
    'Artex Specialist',
    'Coving Specialist',
    
    // Carpentry & Woodwork
    'Carpenter',
    'Joiner',
    'Cabinet Maker',
    'Stair Specialist',
    'Door Fitter',
    'Window Fitter',
    'Skirting Board Specialist',
    
    // Kitchen & Bathroom
    'Kitchen Fitter',
    'Kitchen Designer',
    'Bathroom Designer',
    'Bathroom Renovator',
    'Kitchen Appliance Installer',
    
    // Landscaping & Garden
    'Gardener',
    'Landscaper',
    'Tree Surgeon',
    'Lawn Care Specialist',
    'Hedge Trimmer',
    'Garden Designer',
    'Paving Specialist',
    'Decking Specialist',
    'Fencing Specialist',
    'Fencer',
    
    // Cleaning & Maintenance
    'Cleaner',
    'Window Cleaner',
    'Carpet Cleaner',
    'Upholstery Cleaner',
    'Gutter Cleaner',
    'Pressure Washer',
    'Deep Clean Specialist',
    
    // Handyman Services
    'Handyman',
    'General Repair',
    'Furniture Assembly',
    'Picture Hanging',
    'Shelf Installation',
    'Curtain Fitting',
    
    // Security & Locks
    'Locksmith',
    'Security System Installer',
    'CCTV Installer',
    'Alarm Installer',
    'Safe Specialist',
    
    // Specialized Services
    'Welder',
    'Metal Worker',
    'Glazier',
    'Glass Specialist',
    'Mirror Installer',
    'Upholsterer',
    'Furniture Repair',
    'Antique Restorer',
    
    // Pest & Wildlife
    'Pest Control',
    'Wildlife Removal',
    'Bird Control',
    'Rodent Specialist',
    
    // Appliance & Electronics
    'Appliance Repair',
    'Washing Machine Repair',
    'Dishwasher Repair',
    'Oven Repair',
    'Fridge Repair',
    'TV Repair',
    'Computer Repair',
    
    // Automotive
    'Car Mechanic',
    'Mobile Mechanic',
    'Car Electrician',
    'Tyre Fitter',
    'MOT Tester',
    
    // Moving & Storage
    'Removal Specialist',
    'Packing Service',
    'Storage Solutions',
    'Man with Van',
    
    // Health & Safety
    'Health & Safety Consultant',
    'Fire Safety Specialist',
    'Asbestos Removal',
    'Mold Specialist',
    
    // Renewable Energy
    'Solar Panel Installer',
    'Heat Pump Installer',
    'Insulation Specialist',
    'Energy Assessor'
  ];

  const budgetTypeOptions = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  const timeOptions = [
    { value: 'any', label: 'Any Time' },
    { value: 'morning', label: 'Morning (8AM-12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM-5PM)' },
    { value: 'evening', label: 'Evening (5PM-8PM)' }
  ];

  // AI-powered job description suggestions based on trade
  const getAISuggestions = (trade: string) => {
    const suggestions = {
      'Plumber': [
        "I need a qualified plumber to fix a leaking kitchen tap. The tap has been dripping constantly for 2 days. Located under the sink, easy access. Please bring necessary parts.",
        "Bathroom toilet is blocked and won't flush properly. Need urgent plumbing help. Have tried basic unblocking but issue persists. Ground floor bathroom.",
        "Installing a new washing machine in utility room. Need plumber to connect water supply and drainage. All pipes are accessible. Machine is already delivered.",
        "Shower pressure is very low in upstairs bathroom. All other taps work fine. Need diagnosis and repair. Prefer morning appointment if possible."
      ],
      'Electrician': [
        "Need qualified electrician to install 3 new power sockets in living room. Walls are plasterboard, easy access. All materials to be provided by tradesperson.",
        "Kitchen lights keep flickering and sometimes go off completely. Need urgent electrical inspection and repair. Safety concern with young children in house.",
        "Installing new electric oven in kitchen. Need electrician to connect to mains supply. Existing connection point available. Oven is already purchased.",
        "Outdoor security lights not working after recent storm. Need electrician to check wiring and replace if necessary. 2 lights on front of house."
      ],
      'Builder': [
        "Need experienced builder for kitchen extension. Planning permission approved. Extension is 3m x 4m, single story. Need foundation work, walls, and roof.",
        "Converting garage into home office. Need builder to remove garage door, install window, and create proper entrance. Garage is attached to house.",
        "Building garden wall along property boundary. Wall is 15m long x 1.8m high. Need proper foundations and drainage. Planning permission already obtained.",
        "Loft conversion - need builder for structural work including steel beams, floor joists, and staircase installation. Architect drawings available."
      ],
      'Painter': [
        "Need living room painted - 2 coats throughout. Room size: 4m x 5m, standard height ceiling. Currently magnolia, want to change to light grey. Include ceiling.",
        "Exterior front door needs stripping and repainting. Door is wooden, currently blue paint is peeling. Want professional finish in black. Include frame touch-up.",
        "Bedroom wallpaper removal and painting. One feature wall has textured wallpaper that needs careful removal. Room is 3m x 4m. Paint in neutral colors.",
        "Hallway and stairs decorating. Walls need filling and painting, woodwork needs gloss paint. High ceiling area, need experienced decorator with proper equipment."
      ],
      'Roofer': [
        "Several roof tiles are loose/missing after recent storm. Need roofer to inspect and replace tiles. Two-story house, pitched roof. Safety equipment essential.",
        "Guttering is overflowing during rain. Need cleaning and possible repair/replacement. Full house perimeter, includes downpipes. Access from garden available.",
        "Small leak in bedroom ceiling during heavy rain. Need roof inspection to find source and repair. Leak appears to be above window area.",
        "Flat roof garage needs waterproofing. Current felt is cracking and letting water in. Garage is 3m x 6m. Need durable solution."
      ],
      'Gardener': [
        "Garden lawn needs complete renovation. Current grass is patchy and full of weeds. Garden is 10m x 8m, south-facing. Want professional lawn laying.",
        "Building raised flower beds along garden fence. Need 3 beds, each 2m long x 1m wide x 0.5m high. Include soil and basic planting advice.",
        "Garden maintenance contract - need regular gardener for weekly maintenance. Garden is 200sqm with lawn, borders, and small trees. Prefer Friday mornings.",
        "Patio area needs pressure washing and re-pointing. Patio is 4m x 6m, natural stone. Some slabs are loose and need re-laying."
      ],
      'Tiler': [
        "Bathroom needs complete tiling - walls and floor. Bathroom is 2m x 2m. Want white subway tiles on walls, grey porcelain tiles on floor. Include grouting.",
        "Kitchen splashback tiling. Need 3m of splashback tiled behind cooker and sink. Want white metro tiles with grey grout. Easy access, no obstacles.",
        "Floor tiling in hallway. Hallway is 2m x 4m, currently carpeted. Want porcelain tiles throughout. Need to remove carpet and prepare subfloor.",
        "Shower cubicle tiling - need waterproof tiling for walk-in shower. Shower is 1m x 1m. Need proper waterproofing and drainage. Tiles already purchased."
      ],
      'Carpenter': [
        "Need custom-built shelving unit for living room alcove. Measurements: 2m wide x 2.5m high x 30cm deep. Pine wood preferred. Include 4 adjustable shelves.",
        "Kitchen cabinet door has come off hinges and won't close properly. Need carpenter to repair or replace hinges. Door is solid wood, standard size.",
        "Building a garden shed foundation and frame. Concrete base already laid. Need experienced carpenter for wooden frame construction. Materials list available.",
        "Wooden stairs creaking badly, especially 3rd and 7th steps. Need carpenter to inspect and repair. Stairs are painted softwood, straight flight."
      ],
      'Locksmith': [
        "Front door lock is jammed and won't open with key. Need urgent locksmith to repair or replace lock. Family locked out of house. Emergency call-out required.",
        "Installing new security locks on all external doors. Need high-security locks with anti-snap protection. 3 doors total - front, back, and side door.",
        "Lost keys for front door and need new keys cut. Lock is a standard 5-lever mortice lock. Need locksmith to make new keys from lock.",
        "Garage door lock broken - won't lock properly. Need locksmith to repair or replace. Garage is detached, good access. Prefer morning appointment."
      ],
      'Cleaner': [
        "Deep clean of entire house after renovation work. 3-bedroom house, lots of dust and debris. Need professional cleaning team with industrial equipment.",
        "End of tenancy cleaning required. 2-bedroom flat, good condition but needs thorough clean for deposit return. Include oven, carpets, windows.",
        "Office cleaning contract - small office with 6 desks, kitchen area, 2 bathrooms. Need weekly cleaning service. Prefer early morning or evening.",
        "Carpet cleaning for living room and stairs. High-traffic areas with some stains. Carpets are light colored, need professional steam cleaning."
      ],
      'Handyman': [
        "Various small jobs around the house: fix squeaky door hinges, replace broken light switch, adjust wardrobe door, touch up paint in hallway.",
        "Flat-pack furniture assembly - large wardrobe and chest of drawers for bedroom. All parts and instructions included. Need someone with experience.",
        "Picture hanging and wall mounting - need 8 large pictures hung securely, plus TV wall mount in living room. Walls are plasterboard over brick.",
        "Garden gate repair - wooden gate is sagging and won't close properly. Hinges may need replacing. Gate is 1.8m high, standard width."
      ],
      'Plasterer': [
        "Living room ceiling needs re-plastering after water damage. Ceiling is 4m x 5m, standard height. Need proper preparation and smooth finish.",
        "New wall needs plastering - recently built partition wall in bedroom. Wall is 3m x 2.5m. Need professional finish ready for painting.",
        "Artex ceiling needs skimming over. Ceiling is 3m x 4m. Want smooth finish without removing artex. Need experienced plasterer.",
        "Hallway walls need patching and re-plastering. Several holes and cracks need filling. Walls are standard height, good access."
      ],
      'Flooring': [
        "Living room needs new laminate flooring. Room is 4m x 5m. Need underlay, skirting boards, and door trims. Floor is level, no preparation needed.",
        "Carpet fitting for 3 bedrooms. Rooms are standard size, need carpet, underlay, and gripper rods. Stairs also need carpeting.",
        "Kitchen vinyl flooring installation. Kitchen is 3m x 4m. Need waterproof vinyl suitable for kitchen use. Easy access, no obstacles.",
        "Bathroom floor tiling. Bathroom is 2m x 2m. Need waterproof tiles suitable for bathroom. Include proper sealing and grouting."
      ],
      'Kitchen Fitter': [
        "Complete kitchen installation - new kitchen units, worktops, and appliances. Kitchen is L-shaped, 4m total length. All units and appliances delivered.",
        "Kitchen worktop replacement - current laminate is damaged. Kitchen is L-shaped, approximately 4m total length. Prefer granite or quartz surface.",
        "Kitchen cabinet doors need replacing - existing carcasses are good. 12 doors and 4 drawer fronts. Prefer modern white gloss finish.",
        "Kitchen island installation - need freestanding island unit with electrical connection. Island is 2m x 1m. Need proper electrical work included."
      ],
      'Bathroom Fitter': [
        "Complete bathroom renovation - remove old suite and install new. Bathroom is 2m x 2m, includes tiling, plumbing, electrical work. New suite already purchased.",
        "Installing new bathroom shower - converting bath to walk-in shower. Need tiling, plumbing, and waterproofing. Bathroom is upstairs, good access.",
        "Bathroom suite replacement - new toilet, basin, and bath. Bathroom is 2m x 2m. Need proper plumbing connections and waste disposal.",
        "Bathroom extractor fan installation. Bathroom gets very steamy, need powerful fan with timer. Ducting to external wall required."
      ],
      'Heating Engineer': [
        "Central heating boiler not working - no hot water or heating. Boiler is 8 years old, serviced annually. Need urgent repair, family with young children.",
        "Radiator in bedroom not heating up while others work fine. Need heating engineer to diagnose and repair. System was working fine until last week.",
        "Annual boiler service required. Gas boiler, last serviced 12 months ago. Need Gas Safe registered engineer. Prefer morning appointment.",
        "New radiator installation in extension. Need heating engineer to connect new radiator to existing system. Extension is 3m x 4m."
      ],
      'Gas Engineer': [
        "Gas boiler service and safety check. Boiler is 5 years old, last serviced 12 months ago. Need Gas Safe registered engineer with certificate.",
        "Gas cooker installation - new gas cooker needs connecting to gas supply. Need qualified gas engineer for safe installation.",
        "Gas fire installation in living room. Need gas engineer to install new gas fire with proper ventilation and safety checks.",
        "Gas leak investigation - smell of gas in kitchen area. Need urgent gas engineer to check for leaks and make safe."
      ],
      'Landscaper': [
        "Garden design and landscaping - complete garden makeover. Garden is 10m x 8m, currently overgrown. Want low-maintenance design with patio area.",
        "Patio installation - need new patio area 4m x 3m. Want natural stone paving with proper foundations and drainage.",
        "Garden lighting installation - need outdoor lighting for garden paths and patio area. Need qualified electrician for electrical work.",
        "Garden drainage - garden floods during heavy rain. Need proper drainage system installed. Garden is 8m x 6m, good access."
      ],
      'Tree Surgeon': [
        "Tree pruning required - large oak tree overhanging neighbor's property. Need qualified tree surgeon with insurance. Tree is approximately 15m tall.",
        "Tree removal - dead tree needs removing from garden. Tree is 10m tall, good access. Need proper disposal of wood and stump grinding.",
        "Hedge trimming - large hedge needs professional trimming. Hedge is 20m long x 3m high. Need experienced tree surgeon with proper equipment.",
        "Tree inspection - concerned about tree health. Need qualified arborist to inspect and provide report on tree condition."
      ],
      'Window Cleaner': [
        "Regular window cleaning service - need monthly cleaning for 3-bedroom house. Windows are standard size, easy access from ground level.",
        "One-off deep clean - windows haven't been cleaned for 6 months. Need professional cleaning inside and out. House has 12 windows total.",
        "Commercial window cleaning - office building needs monthly cleaning. Building has 20 windows, some on first floor. Need experienced cleaner.",
        "Gutter cleaning and window cleaning - need both services. House is 2-story, gutters are accessible. Windows are standard residential size."
      ],
      'Carpet Fitter': [
        "Carpet fitting for 3 bedrooms. Rooms are standard size, need carpet, underlay, and gripper rods. Stairs also need carpeting.",
        "Carpet replacement in living room. Room is 4m x 5m, need carpet removal and new carpet fitting. Easy access, no obstacles.",
        "Carpet stretching - existing carpet is loose and needs stretching. Living room carpet is 4m x 5m, good condition otherwise.",
        "Carpet repair - carpet has tear near door. Need professional repair to make good. Carpet is good quality, worth repairing."
      ],
      'Decorator': [
        "Living room decorating - walls need painting, woodwork needs gloss paint. Room is 4m x 5m, standard height ceiling. Paint in neutral colors.",
        "Exterior painting - front of house needs repainting. Walls are rendered, need proper preparation and weather-resistant paint.",
        "Wallpaper hanging - bedroom needs wallpaper on feature wall. Wall is 3m x 2.5m, need professional hanging with proper alignment.",
        "Kitchen decorating - walls need painting, woodwork needs gloss paint. Kitchen is 3m x 4m, need paint suitable for kitchen use."
      ],
      'Welder': [
        "Metal gate repair - garden gate needs welding repair. Gate is 1.8m high, standard width. Need professional welding to make good.",
        "Metal railing installation - need new metal railing for stairs. Railing is 3m long, need proper welding and finishing.",
        "Metal furniture repair - garden furniture needs welding repair. Table and chairs are metal, need professional welding work.",
        "Metal gate installation - need new metal gate for driveway. Gate is 3m wide, need proper installation with hinges and lock."
      ],
      'Fencer': [
        "Garden fence replacement - need new fence along property boundary. Fence is 15m long x 1.8m high. Need proper posts and panels.",
        "Fence repair - existing fence has damaged panels. Need replacement panels and post repair. Fence is 10m long, good access.",
        "Garden gate installation - need new gate in fence. Gate is 1m wide, need proper hinges and lock. Fence is 1.8m high.",
        "Fence staining - wooden fence needs staining for protection. Fence is 20m long x 1.8m high, need professional application."
      ],
      'Pest Control': [
        "Wasp nest removal - large wasp nest in garden shed. Need professional removal with proper safety equipment. Nest is accessible.",
        "Mouse problem - mice in kitchen area. Need pest control treatment and prevention. Kitchen is 3m x 4m, need thorough treatment.",
        "Ant problem - ants in kitchen and bathroom. Need pest control treatment and prevention. Need professional treatment for both areas.",
        "Bed bug treatment - suspected bed bug infestation. Need professional inspection and treatment. Bedrooms need thorough treatment."
      ],
      'Security Installer': [
        "CCTV installation - need 4 cameras around property. Need professional installation with proper wiring and recording system.",
        "Alarm system installation - need burglar alarm for house. Need professional installation with proper sensors and monitoring.",
        "Security lighting - need outdoor security lighting. Need qualified electrician for proper installation and wiring.",
        "Smart doorbell installation - need video doorbell with app connection. Need professional installation with proper wiring."
      ],
      'TV Aerial Installer': [
        "TV aerial installation - need new aerial for digital TV. House is 2-story, need proper installation and alignment.",
        "Satellite dish installation - need satellite dish for TV. Need professional installation with proper alignment and wiring.",
        "TV aerial repair - existing aerial not working properly. Need professional inspection and repair. Aerial is accessible.",
        "Multiple TV points - need TV points in 3 rooms. Need professional installation with proper wiring and connections."
      ],
      'Appliance Repair': [
        "Washing machine repair - machine not spinning properly. Need professional repair with proper diagnosis and parts.",
        "Dishwasher repair - dishwasher not cleaning properly. Need professional repair with proper diagnosis and parts.",
        "Oven repair - oven not heating properly. Need professional repair with proper diagnosis and parts.",
        "Fridge repair - fridge not cooling properly. Need professional repair with proper diagnosis and parts."
      ],
      'Upholsterer': [
        "Sofa reupholstering - 3-seater sofa needs new fabric. Sofa is good condition, need professional reupholstering.",
        "Chair repair - dining chair needs reupholstering. Chair is good condition, need professional repair.",
        "Cushion making - need new cushions for sofa. Need professional making with proper fabric and filling.",
        "Furniture repair - armchair needs reupholstering. Chair is good condition, need professional repair."
      ],
      'Glazier': [
        "Window glass replacement - broken window pane needs replacing. Window is standard size, need professional replacement.",
        "Door glass replacement - door has broken glass panel. Need professional replacement with proper sealing.",
        "Mirror installation - need large mirror installed on wall. Mirror is 1m x 1.5m, need professional installation.",
        "Glass door repair - sliding glass door needs repair. Door is 2m wide, need professional repair work."
      ]
    };

    return suggestions[trade as keyof typeof suggestions] || [
      "Please describe your job in detail including: what needs to be done, location/room, any specific requirements, materials needed, and preferred timing.",
      "Be specific about the problem or work required. Include measurements, colors, materials, or any special considerations.",
      "Mention if you have materials already or if the tradesperson should provide them. Include access information and any time constraints.",
      "Describe the current situation and what you want to achieve. Include any relevant background information or previous attempts to fix the issue."
    ];
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      jobDescription: suggestion
    }));
    setSelectedSuggestion(suggestion);
    setShowAISuggestions(false);
  };

  const handleDescriptionFocus = () => {
    if (formData.trade && !formData.jobDescription) {
      setShowAISuggestions(true);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsSubmitting(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `job-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-images')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('job-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // reCAPTCHA bot protection
      const token = await execute('job_post');
      if (token) {
        const verifyRes = await fetch('/api/recaptcha/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          setError('We could not verify you are human. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Get user email from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('You must be logged in to post a job');
      }

      const user = JSON.parse(userData);
      const clientEmail = user.email;

      // Create job posting via API
      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail,
          trade: formData.trade,
          jobDescription: formData.jobDescription,
          postcode: formData.postcode,
          budget: formData.budget,
          budgetType: formData.budgetType,
          images: formData.images,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post job');
      }

      setSuccess('Job posted successfully!');
      
      // Reset form
      setFormData({
        trade: '',
        jobDescription: '',
        postcode: '',
        budget: '',
        budgetType: 'fixed',
        preferredDate: '',
        preferredTime: 'any',
        images: []
      });

      // Call callback if provided
      if (onJobPosted) {
        onJobPosted();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>
          Fill in the details below to post your job and find the right tradesperson
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="trade">Trade Required *</Label>
            <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {tradeOptions.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="jobDescription" className="text-base font-semibold text-gray-800">
                Job Description *
              </Label>
              {formData.trade && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  <span className="mr-1">✨</span>
                  AI Assistant
                </Button>
              )}
            </div>
            
            <Textarea
              id="jobDescription"
              placeholder="✍️ Describe your project in detail... Need inspiration? Try our AI Assistant above!"
              value={formData.jobDescription}
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              onFocus={handleDescriptionFocus}
              rows={5}
              required
              className="border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-base leading-relaxed"
            />
            

            {/* AI Suggestions Panel */}
            {showAISuggestions && formData.trade && (
              <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-xl animate-in slide-in-from-top-2 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✨</span>
                    </div>
                    <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                
                <p className="text-sm text-purple-700 mb-4 bg-white/50 p-3 rounded-lg border border-purple-200">
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

          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode *</Label>
            <Input
              id="postcode"
              type="text"
              placeholder="e.g., SW1A 1AA"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetType">Budget Type</Label>
              <Select value={formData.budgetType} onValueChange={(value) => handleInputChange('budgetType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images (Optional)</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Upload images to help tradespeople understand the job better
            </p>
          </div>

          {formData.images.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Images</Label>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Job image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Posting Job...' : 'Post Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 