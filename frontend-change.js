// À remplacer dans booking-app.html, dans confirmBtn.onclick,
// à la place du bloc "simulate payment processing" :

confirmBtn.onclick = async () => {
  if (!clientState.name.trim()) { alert('Merci de renseigner ton nom.'); return; }
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Redirection vers le paiement…';

  const svc = clientState.selectedService;

  const res = await fetch('https://TON-BACKEND.exemple.com/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceName: svc.name,
      date: clientState.selectedDate,
      time: clientState.selectedTime,
      clientName: clientState.name.trim(),
      clientPhone: clientState.phone.trim(),
      depositAmount: svc.deposit,
    }),
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url; // redirige vers la vraie page de paiement Stripe
  } else {
    alert('Erreur lors de la création du paiement.');
    confirmBtn.disabled = false;
  }
};
