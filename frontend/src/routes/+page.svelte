<script lang="ts">
	import { goto } from '$app/navigation';
	import LogoText from '$lib/components/LogoText.svelte';
	import LogoMascot from '$lib/components/LogoMascot.svelte';
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';
</script>

<div class="animate-slide-in flex flex-col md:flex-row min-h-screen items-center justify-center px-4 md:px-0">
  <div class="flex flex-col items-center md:items-start md:mr-4">
    <LogoText class="w-full max-w-xs md:max-w-none" />
    <button
      class="text-2xl text-center font-medium w-full max-w-70 mt-7 mb-4 p-3 drop-shadow-xl rounded-full bg-lblue flex items-center justify-center gap-2"
      onclick={() => goto('/signup')}
    >
      Sign Up Now
      <ArrowIcon />
    </button>
    <div class="flex flex-col md:flex-row items-center">
      <p class="font-medium text-xl md:text-2xl"> Already have an account?</p>
      <div class="flex flex-col items-center md:items-start mt-2 md:mt-0">
        <a href="/login" class="text-mblue text-xl md:text-2xl md:ml-4">Log in</a>
        <span class="md:ml-4 mt-1 h-0.5 w-16 bg-mblue"></span>
      </div>
    </div>
  </div>
  <div class="mascot-bob mt-8 md:mt-0">
    <LogoMascot class="w-48 md:w-auto" />
  </div>
</div>

<style>
  @keyframes mascot-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  .mascot-bob {
    animation: mascot-bob 2.6s ease-in-out infinite;
  }
</style>
