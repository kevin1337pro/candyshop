<?php if ( ! defined( 'ABSPATH' ) ) { exit; } get_header(); ?>
<main id="main" class="section-wrap page-content"><?php while ( have_posts() ) : the_post(); ?><article <?php post_class(); ?>><h1><?php the_title(); ?></h1><?php if ( has_post_thumbnail() ) { the_post_thumbnail( 'large' ); } the_content(); wp_link_pages(); ?></article><?php endwhile; ?></main><?php get_footer(); ?>
