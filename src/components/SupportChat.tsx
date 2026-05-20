import { useEffect, useState, useRef, useMemo } from 'react';
import { MessageCircle, X, Send, Shield, Layout, UserPlus, Home, Scroll, LifeBuoy, ChevronLeft, Bot, ExternalLink, MapPin, Eye, Loader2, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

type ChatState = 'idle' | 'menu' | 'security' | 'prims' | 'rentals' | 'rules' | 'faq' | 'available_rentals' | 'contact_esc' | 'invite_confirm' | 'invite_prompt' | 'invite_sent' | 'my_rental' | 'prim_usage' | 'security_access' | 'security_logs' | 'open_support_ticket' | 'talk_to_support' | 'my_support_tickets' | 'how_to_rent';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import { useResidentContext } from '../context/ResidentContext';
// ...
export default function SupportChat() {
  const { residentProperty } = useResidentContext();
  const { t, i18n } = useTranslation();
// ...
  const [isOpen, setIsOpen] = useState(false);
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [uuid, setUuid] = useState('');
  const [residentData, setResidentData] = useState<any>(null);
  const [ticketMsg, setTicketMsg] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [availableRentals, setAvailableRentals] = useState<any[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [rentalsError, setRentalsError] = useState<string | null>(null);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [rentalsPage, setRentalsPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[ResidentAssistant received resident rental prop]', residentProperty);
  }, [residentProperty]);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  const fetchAvailableRentals = async () => {
    setRentalsLoading(true);
    setRentalsError(null);

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableRentals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('[SupportChat] Error fetching rentals:', e);
      setAvailableRentals([]);
      setRentalsError(e?.message || 'Could not load available rentals.');
    } finally {
      setRentalsLoading(false);
    }
  };

  const getSafeText = (value: any, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return fallback;
  };

  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return null;
    const cleanUrl = String(url).trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    return null;
  };

  const getPropertyDescription = (property: any) => {
    const lang = i18n.language?.slice(0, 2) || 'en';
    const raw =
      property?.[`description_${lang}`] ||
      property?.description ||
      property?.description_en ||
      property?.description_pt ||
      'Luxury property in Holanbra.';

    return stripHtml(getSafeText(raw, 'Luxury property in Holanbra.'));
  };

  const fetchSupportTickets = async () => {
    setTicketsLoading(true);
    const sessionUuid = residentData?.avatar_uuid || localStorage.getItem('sl_resident_uuid');
    if (!sessionUuid) {
      setSupportTickets([]);
      setTicketsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', sessionUuid.trim())
      .order('created_at', { ascending: false });
    if (!error && data) setSupportTickets(data);
    setTicketsLoading(false);
  };

  useEffect(() => {
    if (chatState === 'available_rentals') {
      fetchAvailableRentals();
    }
  }, [chatState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState]);

  useEffect(() => {
    const handleOpenChat = () => {
        if (!isOpen) setIsOpen(true);
        if (chatState === 'idle') setChatState('menu');
    };
    window.addEventListener('open-support-chat', handleOpenChat as EventListener);
    return () => window.removeEventListener('open-support-chat', handleOpenChat as EventListener);
  }, [isOpen, chatState]);

  useEffect(() => {
    if (!isOpen) {
      setUuid('');
      setInviteResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Check for existing resident session
    const fetchResident = async () => {
      const savedName = localStorage.getItem('sl_resident_name');
      const savedPass = localStorage.getItem('sl_resident_pass');
      
      console.log('[SupportChat] Checking resident session', { hasName: !!savedName, hasPass: !!savedPass });

      if (savedName && savedPass) {
        try {
          const { data } = await supabase
            .from('renters')
            .select('avatar_uuid, avatar_name')
            .eq('avatar_name', savedName.trim())
            .eq('password', savedPass.trim())
            .maybeSingle();
          
          if (data) {
            console.log('[SupportChat] Resident detected', data);
            setResidentData(data);
          } else {
            console.log('[SupportChat] No resident data found');
          }
        } catch (e) {
          console.warn('[SupportChat] Session fetch failed', e);
        }
      }
    };
    fetchResident();

    // Initialize Tawk.to
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {};
    // @ts-ignore
    window.Tawk_LoadStart = new Date();

    // @ts-ignore
    window.Tawk_API.onLoad = function() {
      // @ts-ignore
      window.Tawk_API.hideWidget();
      setIsTawkLoaded(true);
    };

    (function(){
      var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/69f4c78fb402371c38a67bb1/1jni2n33k';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    })();
  }, []);

  useEffect(() => {
    console.log('[SupportChat] detected mode', {
      isResident: !!residentData?.avatar_uuid,
      residentUuid: residentData?.avatar_uuid,
    });
  }, [residentData]);

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setChatState('menu');
    }
  };

  const openTawk = () => {
    // @ts-ignore
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
      setIsOpen(false);
      setIsLiveChatOpen(true);
    }
  };

  const backToAssistant = () => {
    try {
      // @ts-ignore
      if (window.Tawk_API) {
        // @ts-ignore
        if (typeof window.Tawk_API.minimize === 'function') window.Tawk_API.minimize();
        // @ts-ignore
        if (typeof window.Tawk_API.hideWidget === 'function') window.Tawk_API.hideWidget();
      }
    } catch (e) {}

    setIsLiveChatOpen(false);
    setIsOpen(true);
    setChatState('menu');
  };

  const handleInvite = async (forcedUuid?: string) => {
    const targetUuid = (forcedUuid || uuid).trim();
    
    // Requirement 1: Check for resident login
    if (!residentData?.avatar_uuid) {
      setInviteResult({ 
        success: false, 
        message: t('support.responses.invite_login_required') 
      });
      setChatState('invite_sent');
      return;
    }

    if (!targetUuid || !UUID_REGEX.test(targetUuid)) {
      setInviteResult({ 
        success: false, 
        message: t('support.responses.invite_invalid') 
      });
      setChatState('invite_sent');
      return;
    }
    
    setIsSendingInvite(true);
    const endpoint = '/api/smartbots/group-invite';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          avatar_uuid: targetUuid,
          resident_uuid: residentData.avatar_uuid,
          language: i18n.language?.slice(0, 2) || 'en'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('[SmartBots Invite Error RAW]', JSON.stringify(data, null, 2));
      }

      let finalMessage = data.success ? t('support.responses.invite_success') : t('support.responses.invite_error');
      
      if (!data.success) {
        const errorText = (data.error || '').toLowerCase();
        if (errorText.includes('resident login required')) {
          finalMessage = t('support.responses.invite_login_required');
        } else if (errorText.includes('wrong resident uuid')) {
          finalMessage = "This avatar UUID was not accepted by SmartBots. Please check the Second Life avatar UUID.";
        } else if (errorText.includes('bot not found')) {
          finalMessage = "The SmartBots bot name or access settings are incorrect.";
        } else if (errorText.includes('wrong access code')) {
          finalMessage = "The SmartBots access code is incorrect.";
        } else if (errorText.includes('group not found')) {
          finalMessage = "The group UUID is incorrect.";
        } else if (data.error) {
          finalMessage = `SmartBots could not send the invite: ${data.error}`;
        }
      }

      setInviteResult({ 
        success: data.success, 
        message: finalMessage
      });
      setChatState('invite_sent');
    } catch (error) {
      console.error(`[SupportChat] Network or Runtime Error Calling ${endpoint}:`, error);
      setInviteResult({ success: false, message: t('support.responses.invite_error') });
      setChatState('invite_sent');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const [rentalData, setRentalData] = useState<any>(null);
  const [primData, setPrimData] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Robust detection
  const isResident = useMemo(() => {
      const isDataValid = !!residentData?.avatar_uuid;
      const hasStorage = !!localStorage.getItem('sl_resident_uuid');
      return isDataValid || hasStorage;
  }, [residentData]);

  useEffect(() => {
    console.log('[SupportChat] detected mode', {
      isResident,
      residentUuid: residentData?.avatar_uuid || localStorage.getItem('sl_resident_uuid'),
    });
  }, [isResident, residentData]);

  const safeT = (key: string, enFallback: string) => {
    const val = t(key);
    return val === key ? enFallback : val;
  };

  const getResidentPropertyContext = async (residentUuid: string) => {
    try {
      if (!residentUuid) return { residentUuid, property: null, casperletId: null, propertyName: null, primData: null };

      // 1. Try to find property directly via properties.tenant_id
      let { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', residentUuid)
        .maybeSingle();

      // 2. Fallback: Lookup via property_tenants mapping
      if (!property) {
        const { data: mapping } = await supabase
          .from('property_tenants')
          .select('property_id')
          .eq('tenant_id', residentUuid)
          .maybeSingle();
        
        if (mapping && mapping.property_id) {
            const { data: propData } = await supabase
                .from('properties')
                .select('*')
                .eq('id', mapping.property_id)
                .maybeSingle();
            property = propData;
        }
      }

      if (!property && residentProperty?.tenant_id === residentUuid) {
        console.log('[ResidentAssistant] Using residentProperty as fallback only');
        property = residentProperty;
      }

      // 3. Supplement: Get prim record (prims_used, prim_limit)
      let primRes: any = null;
      let groupedPrimRows: any[] = [];

      const { data: directPrimRes } = await supabase
        .from('prim_residents')
        .select('casperlet_id, prims_used, prim_limit, resident_name, resident_key')
        .eq('resident_key', residentUuid)
        .maybeSingle();

      if (directPrimRes) {
        primRes = directPrimRes;
      }

      const casperletId = property?.casperlet_id || primRes?.casperlet_id || null;

      if (casperletId) {
        const { data: groupRows } = await supabase
          .from('prim_residents')
          .select('casperlet_id, prims_used, prim_limit, resident_name, resident_key')
          .eq('casperlet_id', casperletId);

        groupedPrimRows = groupRows || [];

        if (!primRes && groupedPrimRows.length > 0) {
          primRes = groupedPrimRows.find(row => row.resident_key === residentUuid) || groupedPrimRows[0];
        }
      }

      const totalPrimsUsed = groupedPrimRows.length > 0
        ? groupedPrimRows.reduce((sum, row) => sum + Number(row.prims_used || 0), 0)
        : Number(primRes?.prims_used || 0);

      const primLimit =
        Number(primRes?.prim_limit || 0) ||
        Number(groupedPrimRows.find(row => row.prim_limit)?.prim_limit || 0) ||
        Number(property?.prim_limit || 0) ||
        Number(property?.prims_allowed || 0) ||
        Number(property?.prim_allowance || 0);

      const context = {
        residentUuid,
        property,
        casperletId,
        propertyName: property?.name || null,
        primData: primRes || groupedPrimRows.length > 0 || primLimit
          ? {
              prims_used: totalPrimsUsed,
              prim_limit: primLimit,
              casperlet_id: casperletId
            }
          : null
      };

      console.log('[ResidentAssistant property source]', {
          residentUuid,
          sharedProperty: property,
          sharedCasperletId: context.casperletId
      });
      return context;
    } catch(e) {
      console.error('[ResidentAssistant] getResidentPropertyContext error', e);
      return { residentUuid, property: null, casperletId: null, propertyName: null, primData: null };
    }
  };


  useEffect(() => {
    if (['my_rental', 'prim_usage', 'security_access', 'security_logs', 'my_support_tickets'].includes(chatState) && isResident) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const residentId = residentData?.avatar_uuid || localStorage.getItem('sl_resident_uuid');
          if (!residentId) return;
          
          if (chatState === 'my_support_tickets') {
            await fetchSupportTickets();
            setLoadingData(false);
            return;
          }

          const context = await getResidentPropertyContext(residentId);
          console.log('[ResidentAssistant Action]', chatState, context);
          
          if (chatState === 'my_rental') {
            setRentalData(context);
          } else if (chatState === 'prim_usage') {
            setPrimData(context.primData || null);
          } else if (context.casperletId) {
            if (chatState === 'security_access') {
              try {
                const response = await fetch('/api/security/access', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'status',
                    resident_uuid: residentId,
                    parcel_ids: [context.casperletId]
                  })
                });
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                  setSecurityData(result.data[0]);
                } else {
                  setSecurityData(null);
                }
              } catch (err) {
                console.error('[SupportChat] Error fetching security data:', err);
                setSecurityData(null);
              }
            } else if (chatState === 'security_logs') {
              try {
                const { data } = await supabase
                  .from('security_logs')
                  .select('avatar_name, action, created_at')
                  .eq('casperlet_id', context.casperletId)
                  .order('created_at', { ascending: false })
                  .limit(5);
                
                setSecurityLogs(data || []);
              } catch (e) {
                console.error('[ResidentAssistant] Logs fetch error', e);
                setSecurityLogs([]);
              }
            }
          }

        } catch (e) {
          console.error('[ResidentAssistant] Fetch error:', e);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [chatState, residentData, isResident]);

  const visitorActions = useMemo(() => [
    { id: 'available_rentals', label: t('support.menu.available_rentals', {defaultValue: 'Available Rentals'}), icon: Home },
    { id: 'how_to_rent', label: t('support.menu.how_to_rent', {defaultValue: 'How to Rent'}), icon: Scroll },
    { id: 'talk_to_support', label: t('support.menu.talk_to_support', {defaultValue: 'Talk to Support'}), icon: LifeBuoy }
  ], [t]);

  const residentActions = useMemo(() => [
    { id: 'my_rental', label: t('support.menu.my_rental', {defaultValue: 'My Rental'}), icon: Home },
    { id: 'prim_usage', label: t('support.menu.prim_usage', {defaultValue: 'Prim Usage'}), icon: Layout },
    { id: 'security_access', label: t('support.menu.security_access', {defaultValue: 'Security Access'}), icon: Shield },
    { id: 'security_logs', label: t('support.menu.security_logs', {defaultValue: 'Security Logs'}), icon: Scroll },
    { id: 'rules', label: t('support.menu.rules', {defaultValue: 'Rules'}), icon: Scroll },
    { id: 'group_invite', label: t('support.menu.invite', {defaultValue: 'Group Invite'}), icon: UserPlus },
    { id: 'open_support_ticket', label: t('support.menu.open_support_ticket', {defaultValue: 'Open Support Ticket'}), icon: LifeBuoy },
    { 
      id: 'my_support_tickets', 
      label: t('support.menu.my_support_tickets', {defaultValue: 'My Support Tickets'}), 
      icon: MessageCircle,
      hasBadge: supportTickets.some(t => t.status === 'open' && t.admin_reply)
    },
    { id: 'talk_to_support', label: t('support.menu.talk_to_support', {defaultValue: 'Talk to Support'}), icon: LifeBuoy }
  ], [t, supportTickets]);

  const actions = isResident ? residentActions : visitorActions;
  
  useEffect(() => {
    console.log('[SupportChat Actions]', {
      isResident,
      actionsCount: actions.length,
      actions
    });
  }, [isResident, actions]);

  const handleAction = (id: string) => {
    console.log('[SupportChat Action Click]', { actionId: id, chatMode: isResident ? 'resident' : 'visitor', residentUuid: residentData?.avatar_uuid });
    if (id === 'talk_to_support') {
        // @ts-ignore
        if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
            window.Tawk_API.showWidget();
            window.Tawk_API.maximize();
            setIsOpen(false);
        } else {
            setChatState('talk_to_support'); // Show fallback
        }
    } else if (id === 'group_invite') {
      if (!residentData?.avatar_uuid) {
        setInviteResult({ 
          success: false, 
          message: t('support.responses.invite_login_required') 
        });
        setChatState('invite_sent');
        return;
      }
      setUuid(residentData.avatar_uuid);
      setChatState('invite_confirm'); 
    } else {
      setChatState(id as ChatState);
    }
  };

  const renderExpandedContent = (state: ChatState) => {
    if (state === 'my_rental') {
        if (loadingData) return <div className="p-4 text-white/50 text-sm">{safeT('common.loading', 'Loading...')}</div>
        if (!rentalData) return (
            <div className="p-4 text-white/50 text-sm">
                {safeT('support.responses.no_rental_found', 'I found your resident account, but I couldn’t find a rental linked to it.')}
            </div>
        );
        return (
              <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium space-y-2">
                <p><strong>{safeT('support.rental.name', 'Property')}:</strong> {rentalData.property?.name ?? rentalData.propertyName ?? safeT('support.rental.unknown', 'Unknown')}</p>
                <p><strong>{safeT('support.rental.status', 'Status')}:</strong> {rentalData.property?.status ? rentalData.property.status.charAt(0).toUpperCase() + rentalData.property.status.slice(1) : safeT('support.rental.unknown', 'Unknown')}</p>
                
                {(() => {
                  const expiresAt =
                    rentalData.property?.rented_until ||
                    rentalData.property?.expiry_date ||
                    rentalData.property?.expiry ||
                    rentalData.property?.expires_at ||
                    rentalData.property?.next_payment;

                  if (!expiresAt) return null;

                  const expiryDate = new Date(expiresAt);
                  if (isNaN(expiryDate.getTime())) return null;

                  const now = new Date();
                  const diffInMs = expiryDate.getTime() - now.getTime();
                  const locale = i18n.language?.startsWith('pt') ? 'pt-BR' : 'en-US';

                  const dateLabel = expiryDate.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  const timeLabel = expiryDate.toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  if (diffInMs <= 0) {
                    return (
                      <p>
                        <strong>{safeT('support.rental.expires', 'Expires')}:</strong> {dateLabel} {timeLabel}
                        <br />
                        <span className="text-red-400">{safeT('resident.expired', 'Expired')}</span>
                      </p>
                    );
                  }

                  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                  return (
                    <>
                      <p>
                        <strong>{safeT('support.rental.expires', 'Expires')}:</strong> {dateLabel} {timeLabel}
                      </p>
                      <p>
                        <strong>{safeT('resident.remaining', 'Remaining')}:</strong> {days} days and {hours} hours
                      </p>
                    </>
                  );
                })()}
                   
                {rentalData.property?.prim_limit 
                   ? <p><strong>{safeT('support.rental.prim_limit', 'Prim limit')}:</strong> {rentalData.property.prim_limit}</p>
                   : null}
                
                {!rentalData.property && !rentalData.primData && 
                    <p className="text-white/40">{safeT('support.responses.no_rental_details', 'Rental time details are not available here yet.')}</p>
                }
                
                {rentalData.property?.teleport_url && (
                    <button 
                      onClick={() => window.open(rentalData.property.teleport_url, '_blank')}
                      className="w-full py-2 bg-amber-500 text-black font-bold uppercase rounded-lg text-xs"
                    >
                      {safeT('support.rental.teleport', 'Teleport')}
                    </button>
                )}
            </div>
        );
    }
    if (state === 'prim_usage') {
        if (loadingData) return <div className="p-4 text-white/50 text-sm">{safeT('common.loading', 'Loading...')}</div>
        if (!primData) return <div className="p-4 text-white/50 text-sm">{safeT('support.responses.no_prim_data', 'I couldn’t find prim data for this rental yet.')}</div>
        return (
            <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium space-y-2">
                <p>{safeT('support.prim.used', 'Used prims')}: {primData.prims_used} / {primData.prim_limit}</p>
                <p>{safeT('support.prim.remaining', 'Remaining prims')}: {primData.prim_limit - primData.prims_used}</p>
            </div>
        );
    }
    if (state === 'security_access') {
        if (loadingData) return <div className="p-4 text-white/50 text-sm">{safeT('common.loading', 'Loading...')}</div>
        if (!securityData) return <div className="p-4 text-white/50 text-sm">{safeT('support.responses.no_security_data', 'I found your rental, but I couldn’t find a Security Orb linked to it.')}</div>

        const normalizeSecurityList = (value: any) => {
          if (!value) return [];

          if (Array.isArray(value)) {
            return value
              .map((item) => {
                if (typeof item === 'string') return item;
                return item?.name || item?.avatar_name || item?.display_name || item?.uuid || item?.id || '';
              })
              .filter(Boolean);
          }

          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                return parsed
                  .map((item) => {
                    if (typeof item === 'string') return item;
                    return item?.name || item?.avatar_name || item?.display_name || item?.uuid || item?.id || '';
                  })
                  .filter(Boolean);
              }
            } catch (e) {}

            return value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
          }

          return [];
        };

        const allowedAvatars = normalizeSecurityList(securityData.access_list);
        const bannedAvatars = normalizeSecurityList(securityData.ban_list);

        console.log('[ResidentAssistant] Security data fields', securityData);

        const warningTime =
          securityData.warning_time ??
          securityData.warningTime ??
          securityData.warning_seconds ??
          securityData.warningSeconds ??
          securityData.warn_time ??
          securityData.warnTime ??
          securityData.eject_warning ??
          securityData.ejectWarning ??
          securityData.warning ??
          null;

        return (
            <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium space-y-2">
                <p><strong>{safeT('Status', 'Status')}:</strong> {securityData.active ? 'ON' : 'OFF'}</p>
                <p><strong>{safeT('Radius', 'Radius')}:</strong> {securityData.radius ? `${securityData.radius}m` : safeT('support.security.not_set', 'Not set')}</p>

                {warningTime !== null && warningTime !== undefined && warningTime !== '' ? (
                  <p>
                    <strong>{safeT('Warning time', 'Warning time')}:</strong> {warningTime}s
                  </p>
                ) : (
                  <p>
                    <strong>{safeT('Warning time', 'Warning time')}:</strong> {safeT('support.security.not_set', 'Not set')}
                  </p>
                )}

                <p><strong>{safeT('Allowed avatars', 'Allowed avatars')}:</strong> {allowedAvatars.length}</p>
                {allowedAvatars.length > 0 ? (
                  <ul className="pl-4 list-disc text-white/70 space-y-1">
                    {allowedAvatars.map((name, idx) => (
                      <li key={`allowed-${idx}`}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-xs italic pl-2">
                    No resident guests added. Estate managers may still have staff access.
                  </p>
                )}

                <p><strong>{safeT('Banned avatars', 'Banned avatars')}:</strong> {bannedAvatars.length}</p>
                {bannedAvatars.length > 0 ? (
                  <ul className="pl-4 list-disc text-white/70 space-y-1">
                    {bannedAvatars.map((name, idx) => (
                      <li key={`banned-${idx}`}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-xs italic pl-2">
                    No banned avatars added.
                  </p>
                )}
            </div>
        );
    }
    if (state === 'my_support_tickets') {
        if (ticketsLoading) return <div className="p-4 text-white/50 text-sm">{safeT('common.loading', 'Loading...')}</div>
        if (supportTickets.length === 0) return <div className="p-4 text-white/50 text-sm">{safeT('You don’t have any support tickets yet.', 'You don’t have any support tickets yet.')}</div>
        return (
            <div className="space-y-4">
                {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white/5 rounded-2xl p-4 text-white/80 text-sm leading-relaxed border border-white/5">
                        <p><strong>{safeT('Subject', 'Subject')}:</strong> {ticket.subject}</p>
                        <p><strong>{safeT('Status', 'Status')}:</strong> {ticket.status}</p>
                        <p className="text-white/60 text-xs mt-2">{ticket.message}</p>
                        {ticket.admin_reply && (
                            <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <p className="text-amber-500 text-xs font-bold">{safeT('Staff response', 'Staff response')}:</p>
                                <p className="text-white text-xs">{ticket.admin_reply}</p>
                            </div>
                        )}
                        <p className="text-white/30 text-[10px] mt-2">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        );
    }
    if (state === 'open_support_ticket') {
        const sendTicket = async () => {
          const sessionUuid = residentData?.avatar_uuid || localStorage.getItem('sl_resident_uuid');
          const sessionName = residentData?.avatar_name || localStorage.getItem('sl_resident_name') || 'Resident';

          if (!sessionUuid) {
            setInviteResult({
              success: false,
              message: safeT('support.responses.ticket_login_required', 'Please log in as a resident before opening a support ticket.')
            });
            setChatState('invite_sent');
            return;
          }

          if (!ticketMsg.trim()) {
            return;
          }

          try {
            const { error } = await supabase
              .from('support_tickets')
              .insert({
                user_id: sessionUuid.trim(),
                avatar_name: sessionName.trim(),
                subject: 'Support request from Resident Assistant',
                category: 'Others',
                message: ticketMsg.trim(),
                status: 'open'
              });

            if (error) throw error;

            setTicketMsg('');
            setInviteResult({
              success: true,
              message: safeT('support.responses.ticket_created', 'Your support ticket has been created. You can check replies anytime from My Support Tickets.')
            });
            setChatState('invite_sent');
          } catch (error) {
            console.error('[SupportChat] Ticket creation error:', error);
            setInviteResult({
              success: false,
              message: safeT('support.responses.ticket_error', 'I could not create the ticket. Please try again or contact live support.')
            });
            setChatState('invite_sent');
          }
        };
        return (
            <div className="space-y-3">
                <p className="text-white/80 text-sm">{safeT('support.responses.open_support_ticket', 'Tell me what you need help with, and I’ll create a support ticket.')}</p>
                <input 
                  type="text" 
                  value={ticketMsg} 
                  onChange={(e) => setTicketMsg(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs outline-none focus:border-amber-500/50 transition-all"
                  placeholder={safeT('support.responses.ticket_placeholder', 'Describe your issue...')}
                />
                <button 
                  onClick={sendTicket}
                  className="w-full py-4 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-amber-500/20"
                >
                  {safeT('support.actions.send_ticket', 'Send Ticket')}
                </button>
            </div>
        );
    }
    if (state === 'talk_to_support') {
        return <div className="p-4 text-white/80 text-sm">{safeT('support.responses.talk_to_support', 'Opening live support...')}</div>
    }

    if (state === 'how_to_rent') {
      return (
        <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium space-y-3">
          <p><strong>1.</strong> {t('support.how_to_rent.step_1')}</p>
          <p><strong>2.</strong> {t('support.how_to_rent.step_2')}</p>
          <p><strong>3.</strong> {t('support.how_to_rent.step_3')}</p>
          <p><strong>4.</strong> {t('support.how_to_rent.step_4')}</p>
          <p><strong>5.</strong> {t('support.how_to_rent.step_5')}</p>
          <p><strong>6.</strong> {t('support.how_to_rent.step_6')}</p>
          <p className="text-white/50 text-xs">{t('support.how_to_rent.help')}</p>
        </div>
      );
    }
    if (state === 'security_logs') {
        if (loadingData) return <div className="p-4 text-white/50 text-sm">{safeT('common.loading', 'Loading...')}</div>
        if (!Array.isArray(securityLogs) || securityLogs.length === 0) return <div className="p-4 text-white/50 text-sm">{safeT('support.responses.no_logs', 'No recent security events.')}</div>
        return (
            <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium space-y-2">
                {(securityLogs || []).map((log: any, i: number) => (
                    <p key={i}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                        {log.avatar_name ? ` - ${log.avatar_name}` : ''}
                        {': '}
                        <span className="text-amber-500">
                            {log.action || safeT('Action', 'Action')}
                        </span>
                    </p>
                ))}
            </div>
        );
    }

    
    if (typeof response === 'string') {
      return response.split('[split]').map((msg, i) => (
        <div key={i} className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium mb-3 last:mb-0">
          {msg.trim()}
        </div>
      ));
    }

    if (typeof response === 'object' && response !== null) {
      const parts = [];
      const order = ['content', 'steps', 'details', 'intro', 'summary', 'description'];
      
      for (const key of order) {
        if (response[key]) {
          parts.push(
            <div key={key} className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium mb-3 last:mb-0">
              {response[key]}
            </div>
          );
        }
      }

      if (parts.length > 0) return parts;
    }

    return (
      <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
        {t(`support.responses.${state}`)}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isTawkLoaded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, backgroundColor: '#ffffff' }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleBot}
            className={cn(
              "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[110] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-2xl transition-all border-2 border-black/5 cursor-pointer overflow-hidden",
              isOpen ? "bg-red-500 text-white border-red-400 rotate-90" : "bg-amber-500 text-black border-amber-400"
            )}
          >
            {isOpen ? <X size={24} /> : (isResident ? <Bot size={24} strokeWidth={2.5} /> : <MessageCircle size={24} strokeWidth={2.5} />)}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 z-[110] w-full sm:w-[400px] h-full sm:h-[550px] bg-zinc-950 sm:border sm:border-white/10 sm:rounded-[2.5rem] sm:shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {isLiveChatOpen && (
              <button
                onClick={backToAssistant}
                className="fixed bottom-6 left-4 right-4 sm:bottom-8 sm:right-8 sm:w-auto z-[120] py-4 bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl text-xs hover:scale-[1.01] transition-all shadow-xl shadow-amber-500/20"
              >
                Back to Assistant
              </button>
            )}
            {/* Header */}
            <div className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-white/5 flex items-center justify-between z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black overflow-hidden border-2 border-amber-400 shrink-0">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-white font-display font-black uppercase text-xs tracking-[0.2em]">
                    {isResident ? 'HOLANBRA RESIDENT' : t('support.bot_name')}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              {chatState !== 'menu' && (
                <button 
                  onClick={() => setChatState('menu')}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {/* Bot Welcome */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                  <Bot size={14} />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5">
                  {isResident ? t('support.welcome_resident', {defaultValue: 'Hi, I’m your Holanbra Resident Assistant. What would you like to do today?'}) : t('support.welcome')}
                </div>
              </div>

              {/* Main Menu State */}
              {chatState === 'menu' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="chat-quick-actions flex flex-col gap-2 w-full"
                >
                  <p className="text-white/20 text-[8px] uppercase tracking-widest pl-2">ACTIONS</p>
                  {actions.map((action) => (
                    <motion.button
                      key={action.id}
                      type="button"
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAction(action.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/60 hover:text-amber-500 transition-all text-left group cursor-pointer relative z-10"
                    >
                      <div className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <action.icon size={18} />
                        {action.hasBadge && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em]">{action.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Response State */}
              {(['security', 'prims', 'rentals', 'rules', 'faq', 'my_rental', 'prim_usage', 'security_access', 'security_logs', 'open_support_ticket', 'my_support_tickets', 'how_to_rent'].includes(chatState)) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-amber-500 text-black rounded-2xl rounded-tr-none p-4 text-xs font-black uppercase tracking-widest shadow-lg">
                      {actions.find(i => i.id === chatState)?.label || t(`support.menu.${chatState}`, {defaultValue: chatState})}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-col">
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                        <Bot size={14} />
                      </div>
                      <div className="flex-1">
                        {renderExpandedContent(chatState)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatState('menu')}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display"
                  >
                    {t('common.back_home')}
                  </button>
                </motion.div>
              )}

              {/* Available Rentals State */}
              {chatState === 'available_rentals' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-amber-500 text-black rounded-2xl rounded-tr-none p-4 text-xs font-black uppercase tracking-widest shadow-lg">
                      {t('support.menu.available_rentals')}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {rentalsLoading ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 size={24} className="text-amber-500 animate-spin" />
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Searching properties...</span>
                      </div>
                    ) : rentalsError ? (
                      <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20 text-center text-white/80 text-sm">
                        I couldn’t load available rentals right now. Please try again or contact support.
                      </div>
                    ) : (
                      (() => {
                        console.log('[SupportChat] Rendering available_rentals. Length:', availableRentals.length);
                        return availableRentals.length === 0 ? (
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mx-auto">
                          <Home size={20} />
                        </div>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                          No available rentals right now.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {availableRentals.slice(0, rentalsPage * 5).map((property) => {
                            console.log('[SupportChat] Mapping property:', property.id);
                             const imageUrl = getSafeImageUrl(property.image_url);
                             const propertyName = getSafeText(property.name, 'Available Rental');
                             const price = getSafeText(property.rental_price || property.price, '---');
                             const prims = getSafeText(property.prims_allowed || property.prim_limit || property.prim_allowance, '---');
                             const size = getSafeText(property.size, '---');
                             const description = getPropertyDescription(property);
                             const teleportUrl = getSafeImageUrl(property.teleport_url || property.slurl);

                             return (
                              <div key={property.id} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                {imageUrl && (
                                  <div className="h-32 w-full relative">
                                    <img
                                      src={imageUrl}
                                      alt={propertyName}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute top-3 left-3 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                      {t('properties.status_available')}
                                    </div>
                                  </div>
                                )}
                                <div className="p-4 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-sm">{propertyName}</h4>
                                    <div className="text-amber-500 text-xs font-bold">L$ {price}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                                      <Layers size={12} />
                                      <span>{prims} {t('properties.prims_allowed')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                                      <Layout size={12} />
                                      <span>{size}</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-white/60 line-clamp-2">{description}</p>
                                  {teleportUrl && (
                                    <div className="pt-2">
                                      <button 
                                        onClick={() => window.open(teleportUrl, '_blank')}
                                        className="w-full py-2 bg-amber-500 text-black font-bold uppercase rounded-lg text-xs"
                                      >
                                        Teleport
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                    })()
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setChatState('menu');
                      setRentalsPage(1);
                    }}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display"
                  >
                    {t('common.back_home')}
                  </button>
                </motion.div>
              )}

              {/* Invite Prompt State */}
              {chatState === 'invite_confirm' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
                      {t('support.responses.invite_confirm', { uuid: uuid })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => handleInvite(uuid)}
                      disabled={isSendingInvite}
                      className={cn(
                        "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                        isSendingInvite 
                          ? "bg-white/5 text-white/20 cursor-not-allowed" 
                          : "bg-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95"
                      )}
                    >
                      {isSendingInvite ? t('support.responses.sending') : <><Send size={14} /> {t('support.responses.invite_yes')}</>}
                    </button>
                    <button 
                      onClick={() => {
                        setUuid('');
                        setChatState('invite_prompt');
                      }}
                      className="w-full py-4 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
                    >
                      {t('support.responses.invite_no')}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Invite Entry State */}
              {chatState === 'invite_prompt' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
                      {t('support.responses.invite_prompt')}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text"
                      value={uuid}
                      onChange={(e) => setUuid(e.target.value)}
                      placeholder="Avatar UUID..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                    <button 
                      onClick={() => handleInvite()}
                      disabled={isSendingInvite}
                      className={cn(
                        "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                        isSendingInvite 
                          ? "bg-white/5 text-white/20 cursor-not-allowed" 
                          : "bg-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95"
                      )}
                    >
                      {isSendingInvite ? t('support.responses.sending') : <><Send size={14} /> {t('support.responses.send_invite')}</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Invite Result */}
              {chatState === 'invite_sent' && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                 >
                   <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className={cn(
                      "bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed border font-medium",
                      inviteResult?.success ? "text-emerald-400 border-emerald-500/20" : "text-red-400 border-red-500/20"
                    )}>
                      {inviteResult?.message}
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatState('menu')}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    {t('common.back_home')}
                  </button>
                 </motion.div>
              )}

              {/* Escalation State */}
              {chatState === 'contact_esc' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
                      {t('support.responses.contact_esc')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={openTawk}
                      className="w-full py-5 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-amber-500/20"
                    >
                      {t('support.responses.contact_yes')}
                    </button>
                    <button 
                      onClick={() => setChatState('menu')}
                      className="w-full py-5 rounded-2xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
                    >
                      {t('support.responses.contact_no')}
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer decoration */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/40">
               <div className="flex items-center justify-center gap-2">
                 <Bot size={12} className="text-white/20" />
                 <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Holanbra AI Support System</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
