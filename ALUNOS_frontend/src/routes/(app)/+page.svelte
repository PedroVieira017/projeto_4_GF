<script>
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { redirect } from "@sveltejs/kit";

  if (browser) {
    goto('/inicio');
  } else {
    redirect(307, "/inicio")
  }
</script>